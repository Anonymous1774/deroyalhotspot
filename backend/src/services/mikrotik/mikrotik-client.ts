import { RouterOSClient } from 'routeros-client';
import prisma from '../../lib/prisma';
import { decrypt } from '../../utils/crypto';

interface RouterConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

type RouterApi = any;

const MAX_RETRIES = 3;

function isSimulationMode(): boolean {
  return process.env.MIKROTIK_SIMULATION_MODE === 'true';
}

/**
 * Loads router configurations from database and decrypts credentials symmetrically.
 */
async function getActiveRouterConfig(): Promise<RouterConfig | null> {
  const router = await prisma.router.findFirst();
  
  const fallback = {
    host: '10.10.10.2',
    port: 8728,
    username: 'admin',
    password: 'DeRoyal2024'
  };

  if (!router) return fallback;

  return {
    host: router.host || fallback.host,
    port: router.apiPort || fallback.port,
    username: router.username || fallback.username,
    password: router.encryptedPassword ? decrypt(router.encryptedPassword) : fallback.password
  };
}

function createRouterClient(config: RouterConfig): RouterOSClient {
  return new RouterOSClient({
    host: config.host || '',
    port: config.port || 8728,
    user: config.username || 'admin',
    password: config.password || '',
    timeout: parseInt(process.env.MIKROTIK_TIMEOUT || '5000', 10)
  });
}

/**
 * Opens a RouterOS API connection, runs the callback, and always closes the socket.
 * Retries up to MAX_RETRIES times on transient connection failures.
 */
async function withRouterConnection<T>(
  fn: (api: RouterApi) => Promise<T>,
  config?: RouterConfig
): Promise<T> {
  const activeConfig = config || await getActiveRouterConfig();
  if (!activeConfig || !activeConfig.host) {
    throw new Error('No router configuration found.');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const client = createRouterClient(activeConfig);
    try {
      const api = await client.connect();
      const result = await fn(api);
      await client.close();
      return result;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await client.close().catch(() => {});
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError || new Error('Failed to connect to MikroTik router.');
}

/**
 * Converts a plan duration into MikroTik limit-uptime format (e.g. "1h", "7d").
 */
export function formatLimitUptime(durationValue: number, durationUnit: string): string {
  const unit = durationUnit.toLowerCase();
  if (unit === 'minutes') return `${durationValue}m`;
  if (unit === 'hours') return `${durationValue}h`;
  if (unit === 'days') return `${durationValue}d`;
  return `${durationValue}m`;
}

async function logRouterEvent(action: string, description: string): Promise<void> {
  await prisma.activityLog.create({
    data: {
      adminId: null,
      action,
      module: 'ROUTER',
      description,
      ipAddress: null
    }
  }).catch((e) => console.error('Failed to log router event:', e));
}

/**
 * Verifies the router is reachable before voucher activation proceeds.
 * Skipped when MIKROTIK_SIMULATION_MODE=true.
 */
export async function ensureRouterReachable(): Promise<void> {
  if (isSimulationMode()) return;
  await testRouterConnection();
}

/**
 * Tests MikroTik RouterOS API socket connection.
 */
export async function testRouterConnection(config?: RouterConfig): Promise<boolean> {
  if (isSimulationMode()) return true;

  await withRouterConnection(async () => true, config);
  return true;
}

/**
 * Creates a hotspot user on MikroTik for an activated voucher.
 * Username and password are both the voucher code per integration spec.
 */
export async function createHotspotUser(params: {
  username: string;
  password: string;
  profile: string;
  limitUptime: string;
  comment?: string;
}): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] createHotspotUser: ${params.username} (${params.profile}, ${params.limitUptime})`);
    return;
  }

  await withRouterConnection(async (api) => {
    // Check if user exists using raw RouterOS query syntax
    const existing = await api.rosApi.write('/ip/hotspot/user/print', [`?name=${params.username}`]);
    if (existing.length > 0) {
      throw new Error(`Hotspot user '${params.username}' already exists on router.`);
    }

    // Add hotspot user using raw commands
    await api.rosApi.write('/ip/hotspot/user/add', [
      `=name=${params.username}`,
      `=password=${params.password}`,
      `=profile=${params.profile}`,
      `=limit-uptime=${params.limitUptime}`,
      `=comment=${params.comment || `DHOS voucher ${params.username}`}`
    ]);
  });

  await logRouterEvent(
    'User Created',
    `Hotspot user '${params.username}' created with profile '${params.profile}' and limit '${params.limitUptime}'.`
  );
}

/**
 * Removes a hotspot user from MikroTik (used for rollback or cleanup).
 */
export async function removeHotspotUser(username: string): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] removeHotspotUser: ${username}`);
    return;
  }

  await withRouterConnection(async (api) => {
    const users = await api.rosApi.write('/ip/hotspot/user/print', [`?name=${username}`]);
    if (users.length === 0) return;
    
    const id = users[0].id || users[0]['.id'];
    if (id) {
      await api.rosApi.write('/ip/hotspot/user/remove', [`=.id=${id}`]);
    }
  });

  await logRouterEvent('User Removed', `Hotspot user '${username}' removed from router.`);
}

/**
 * Terminates an active hotspot session on MikroTik for the given username.
 */
export async function disconnectHotspotSession(username: string): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] disconnectHotspotSession: ${username}`);
    return;
  }

  await withRouterConnection(async (api) => {
    const activeSessions = await api.rosApi.write('/ip/hotspot/active/print', [`?user=${username}`]);
    if (activeSessions.length === 0) return;

    for (const session of activeSessions) {
      const id = session.id || session['.id'];
      if (id) {
        await api.rosApi.write('/ip/hotspot/active/remove', [`=.id=${id}`]);
      }
    }
  });

  await logRouterEvent(
    'Session Disconnected',
    `Hotspot session for user '${username}' terminated on router.`
  );
}

/**
 * Fetches real-time router status and health telemetry.
 * Falls back to Simulation Mode if connection throws.
 */
export async function getRouterHealth() {
  const config = await getActiveRouterConfig();

  if (!config || !config.host) {
    return await getSimulatedHealth('Router configuration missing in database.');
  }

  if (isSimulationMode()) {
    return await getSimulatedHealth('MIKROTIK_SIMULATION_MODE is enabled.');
  }

  try {
    const health = await withRouterConnection(async (api) => {
      // Gather stats from raw RouterOS API commands
      const [identityRes, resourceRes, activeRes, hotspotRes] = await Promise.all([
        api.rosApi.write('/system/identity/print'),
        api.rosApi.write('/system/resource/print'),
        api.rosApi.write('/ip/hotspot/active/print'),
        api.rosApi.write('/ip/hotspot/print')
      ]);

      const identity = identityRes[0]?.name || identityRes[0]?.identity || 'MikroTik';
      const resource = resourceRes[0] || {};
      const activeCount = activeRes.length || 0;
      const hotspotActive = hotspotRes.length > 0 ? 'active' : 'inactive';

      const cpuLoad = parseInt(resource['cpu-load'] || resource.cpuLoad || '0', 10);
      const totalMem = parseInt(resource['total-memory'] || resource.totalMemory || '0', 10);
      const freeMem = parseInt(resource['free-memory'] || resource.freeMemory || '0', 10);
      const uptime = resource.uptime || 'unknown';
      const version = resource.version || 'unknown';

      const memTotalMB = Math.round(totalMem / (1024 * 1024)) || 1024;
      const memFreeMB = Math.round(freeMem / (1024 * 1024)) || 768;
      const memUsagePercent = Math.round(((memTotalMB - memFreeMB) / memTotalMB) * 100) || 0;

      return {
        status: 'ONLINE' as const,
        identity,
        version: `RouterOS v${version}`,
        uptime,
        cpuUsage: cpuLoad,
        memoryTotal: memTotalMB,
        memoryFree: memFreeMB,
        memoryUsage: memUsagePercent,
        connectedUsers: activeCount,
        hotspotStatus: hotspotActive
      };
    });

    const routerRecord = await prisma.router.findFirst();
    if (routerRecord) {
      await prisma.router.update({
        where: { id: routerRecord.id },
        data: {
          status: 'ONLINE',
          lastConnected: new Date()
        }
      });
    }

    return health;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    console.warn('Could not connect to real MikroTik RouterOS. Entering Simulation Mode. Error:', message);

    const routerRecord = await prisma.router.findFirst();
    if (routerRecord && routerRecord.status !== 'OFFLINE') {
      await prisma.router.update({
        where: { id: routerRecord.id },
        data: { status: 'OFFLINE' }
      }).catch((e) => console.error('Failed to update router status in DB:', e));

      await prisma.activityLog.create({
        data: {
          adminId: null,
          action: 'Router Disconnected',
          module: 'ROUTER',
          description: `Lost connection to MikroTik router at ${config.host}:${config.port}. Details: ${message}`,
          ipAddress: null
        }
      }).catch((e) => console.error('Failed to log connection failure:', e));
    }

    return await getSimulatedHealth(`Offline: ${message}`);
  }
}

/**
 * Generates simulated telemetry when no real router is connected.
 */
async function getSimulatedHealth(reason?: string) {
  const activeSessionsCount = await prisma.hotspotSession.count({
    where: { status: 'ONLINE' }
  });

  const cpuUsage = Math.floor(Math.random() * 15) + 5;
  const memoryTotal = 1024;
  const memoryFree = 768 - Math.floor(Math.random() * 50);
  const memoryUsage = Math.round(((memoryTotal - memoryFree) / memoryTotal) * 100);

  return {
    status: 'SIMULATED',
    identity: 'DeRoyal hAP ax3 (Simulated)',
    version: 'RouterOS v7.12.1',
    uptime: '12d 4h 32m',
    cpuUsage,
    memoryTotal,
    memoryFree,
    memoryUsage,
    connectedUsers: activeSessionsCount,
    hotspotStatus: 'active',
    simulationReason: reason
  };
}
