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
 * Executes a RouterOS API query wrapping it in a Promise.race timeout.
 * If the query hangs (a known bug in node-routeros under RouterOS v7 for empty tables),
 * the timeout resolves it to an empty array fallback instead of hanging the HTTP request.
 */
async function safeWrite(api: any, command: string[], timeoutMs: number = 3000): Promise<any[]> {
  try {
    return await Promise.race([
      api.rosApi.write(command),
      new Promise<any[]>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout: ${command[0]}`)), timeoutMs)
      )
    ]);
  } catch (err) {
    console.warn(`[RouterOS API Warning] Query ${command[0]} failed/timed out:`, err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Loads router configurations from database and decrypts credentials symmetrically.
 */
/**
 * Loads router configurations directly from the .env environment variables.
 */
async function getActiveRouterConfig(): Promise<RouterConfig | null> {
  const router = await prisma.router.findFirst();
  
  const fallback = {
    host: process.env.MIKROTIK_HOST || '10.10.10.2',
    port: parseInt(process.env.MIKROTIK_PORT || '8728', 10),
    username: process.env.MIKROTIK_USERNAME || 'admin',
    password: process.env.MIKROTIK_PASSWORD || 'DeRoyal2024'
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
    
    // Catch asynchronous socket errors to prevent node process from crashing
    (client as any).on('error', (err: any) => {
      console.warn(`[RouterOS Socket Error - Attempt ${attempt}]:`, err.message || err);
    });

    try {
      const api = await Promise.race([
        client.connect(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('RouterOS API connection timeout (3s)')), 3000)
        )
      ]);
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
  ip?: string;
}): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] createHotspotUser: ${params.username} (${params.profile}, ${params.limitUptime})`);
    return;
  }

  await withRouterConnection(async (api) => {
    // Print the user list and filter in JS to prevent RouterOS v7 !empty queries bug
    const allUsers = await safeWrite(api, ['/ip/hotspot/user/print']);
    const existing = allUsers.filter((u: any) => u.name === params.username);
    
    if (existing.length > 0) {
      throw new Error(`Hotspot user '${params.username}' already exists on router.`);
    }

    // Add hotspot user using raw array syntax
    await safeWrite(api, [
      '/ip/hotspot/user/add',
      `=name=${params.username}`,
      `=password=${params.password}`,
      `=profile=${params.profile}`,
      `=limit-uptime=${params.limitUptime}`,
      `=comment=${params.comment || `DHOS voucher ${params.username}`}`
    ]);

    // If client IP is provided, trigger the server-side login immediately
    if (params.ip && params.ip !== '0.0.0.0' && !params.ip.startsWith('10.10.10.')) {
      console.log(`[RouterOS API] Logging in client IP ${params.ip} for user ${params.username}...`);
      await safeWrite(api, [
        '/ip/hotspot/active/login',
        `=ip=${params.ip}`,
        `=user=${params.username}`,
        `=password=${params.password}`
      ]).catch((err) => {
        console.warn(`[RouterOS API Warning] Direct login for IP ${params.ip} failed:`, err);
      });
    }
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
    // Print all users and filter in JS to bypass empty query bugs
    const allUsers = await safeWrite(api, ['/ip/hotspot/user/print']);
    const users = allUsers.filter((u: any) => u.name === username);
    if (users.length === 0) return;
    
    const id = users[0].id || users[0]['.id'];
    if (id) {
      await safeWrite(api, ['/ip/hotspot/user/remove', `=.id=${id}`]);
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
    // Print all active sessions and filter in JS
    const activeSessions = await safeWrite(api, ['/ip/hotspot/active/print']);
    const userSessions = activeSessions.filter((s: any) => s.user === username);
    if (userSessions.length === 0) return;

    for (const session of userSessions) {
      const id = session.id || session['.id'];
      if (id) {
        await safeWrite(api, ['/ip/hotspot/active/remove', `=.id=${id}`]);
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
      // Gather stats from raw RouterOS API commands using array syntax
      const [identityRes, resourceRes, activeRes, hotspotRes] = await Promise.all([
        safeWrite(api, ['/system/identity/print']),
        safeWrite(api, ['/system/resource/print']),
        safeWrite(api, ['/ip/hotspot/active/print']),
        safeWrite(api, ['/ip/hotspot/print'])
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
