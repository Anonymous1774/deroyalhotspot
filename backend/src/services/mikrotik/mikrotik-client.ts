import { RouterOSClient } from 'routeros-client';
import prisma from '../../lib/prisma';
import { decrypt, encrypt } from '../../utils/crypto';

export interface RouterConfig {
  id?: string;
  routerDbId?: string;
  name?: string;
  host?: string;
  port?: number;
  useSsl?: boolean;
  username?: string;
  password?: string;
}

export type RouterApi = any;

const MAX_RETRIES = 3;

function isSimulationMode(): boolean {
  return process.env.MIKROTIK_SIMULATION_MODE === 'true';
}

/**
 * Ensures a default router exists in database if none exists.
 * Preserves 100% backward compatibility for single-router setups.
 */
export async function getOrCreateDefaultRouter() {
  let router = await prisma.router.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' }
  });

  if (!router) {
    const defaultHost = process.env.MIKROTIK_HOST || '10.10.10.2';
    const defaultPort = parseInt(process.env.MIKROTIK_PORT || '8728', 10);
    const defaultUser = process.env.MIKROTIK_USERNAME || 'admin';
    const defaultPass = process.env.MIKROTIK_PASSWORD || 'DeRoyal2024';

    router = await prisma.router.create({
      data: {
        name: 'Primary MikroTik Router',
        description: 'Default system router created automatically from environment settings.',
        host: defaultHost,
        apiPort: defaultPort,
        username: defaultUser,
        encryptedPassword: encrypt(defaultPass),
        status: 'UNKNOWN',
        enabled: true
      }
    });
    console.log(`[Multi-Router] Default router initialized in database (ID: ${router.id}).`);
  }

  return router;
}

/**
 * Resolves a router configuration by ID or retrieves the default active router.
 */
export async function getRouterConfig(routerId?: string): Promise<RouterConfig & { routerDbId?: string }> {
  let router = null;

  if (routerId) {
    router = await prisma.router.findFirst({
      where: { id: routerId, deletedAt: null }
    });
  }

  if (!router) {
    router = await getOrCreateDefaultRouter();
  }

  return {
    routerDbId: router.id,
    id: router.id,
    name: router.name,
    host: router.host,
    port: router.apiPort,
    useSsl: router.apiSsl,
    username: router.username,
    password: router.encryptedPassword ? decrypt(router.encryptedPassword) : ''
  };
}

function createRouterClient(config: RouterConfig): RouterOSClient {
  return new RouterOSClient({
    host: config.host || '',
    port: config.port || 8728,
    user: config.username || 'admin',
    password: config.password || '',
    timeout: parseInt(process.env.MIKROTIK_TIMEOUT || '5000', 10),
    tls: config.useSsl || false
  } as any);
}

/**
 * Executes a RouterOS API query wrapping it in a Promise.race timeout.
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
 * Opens a RouterOS API connection for a specific router (by ID or explicit config),
 * executes the callback function, and closes the connection cleanly.
 */
export async function withRouterConnection<T>(
  routerIdOrConfig: string | RouterConfig | undefined,
  fn: (api: RouterApi) => Promise<T>
): Promise<T> {
  const activeConfig = typeof routerIdOrConfig === 'object' 
    ? routerIdOrConfig 
    : await getRouterConfig(routerIdOrConfig);

  if (!activeConfig || !activeConfig.host) {
    throw new Error('No router configuration found.');
  }

  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const client = createRouterClient(activeConfig);
    
    (client as any).on('error', (err: any) => {
      console.warn(`[RouterOS Socket Error - ${activeConfig.name || activeConfig.host} - Attempt ${attempt}]:`, err.message || err);
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

      const latencyMs = Date.now() - startTime;

      // Update router health telemetry in database if router ID is known
      if (activeConfig.routerDbId || activeConfig.id) {
        const targetId = activeConfig.routerDbId || activeConfig.id;
        await prisma.router.update({
          where: { id: targetId },
          data: {
            status: 'ONLINE',
            lastConnected: new Date(),
            lastSeenAt: new Date(),
            lastHealthCheckAt: new Date(),
            latencyMs,
            lastError: null
          }
        }).catch((e) => console.error('Failed to update router state on success:', e));
      }

      return result;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await client.close().catch(() => {});

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  // Update DB status to OFFLINE if persistent failure occurs
  if (activeConfig.routerDbId || activeConfig.id) {
    const targetId = activeConfig.routerDbId || activeConfig.id;
    await prisma.router.update({
      where: { id: targetId },
      data: {
        status: 'OFFLINE',
        lastHealthCheckAt: new Date(),
        lastError: lastError?.message || 'Connection failed'
      }
    }).catch(() => {});
  }

  throw lastError || new Error(`Failed to connect to router ${activeConfig.name || activeConfig.host}.`);
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
 * Tests socket connection to a router.
 */
export async function testRouterConnection(routerIdOrConfig?: string | RouterConfig): Promise<{
  success: boolean;
  status: string;
  latencyMs: number;
  identity?: string;
  version?: string;
  error?: string;
}> {
  if (isSimulationMode()) {
    return {
      success: true,
      status: 'ONLINE',
      latencyMs: 12,
      identity: 'DeRoyal-Router-Simulated',
      version: 'RouterOS v7.12.1'
    };
  }

  const startTime = Date.now();
  try {
    const info = await withRouterConnection(routerIdOrConfig, async (api) => {
      const [identityRes, resourceRes] = await Promise.all([
        safeWrite(api, ['/system/identity/print']),
        safeWrite(api, ['/system/resource/print'])
      ]);
      const identity = identityRes[0]?.name || identityRes[0]?.identity || 'MikroTik';
      const version = resourceRes[0]?.version || 'v7';
      return { identity, version };
    });

    const latencyMs = Date.now() - startTime;

    if (typeof routerIdOrConfig === 'string') {
      await prisma.router.update({
        where: { id: routerIdOrConfig },
        data: {
          routerIdentity: info.identity,
          status: 'ONLINE',
          lastSeenAt: new Date(),
          lastHealthCheckAt: new Date(),
          latencyMs,
          lastError: null
        }
      }).catch(() => {});
    }

    return {
      success: true,
      status: 'ONLINE',
      latencyMs,
      identity: info.identity,
      version: info.version
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      status: 'OFFLINE',
      latencyMs,
      error: error.message || 'Connection failed'
    };
  }
}

/**
 * Verifies specific router or default router is reachable.
 */
export async function ensureRouterReachable(routerId?: string): Promise<void> {
  if (isSimulationMode()) return;
  const res = await testRouterConnection(routerId);
  if (!res.success) {
    throw new Error(res.error || 'Router unreachable');
  }
}

/**
 * Creates a hotspot user on a specific MikroTik router.
 */
export async function createHotspotUser(
  routerId: string | undefined,
  params: {
    username: string;
    password: string;
    profile: string;
    limitUptime: string;
    comment?: string;
    ip?: string;
    rateLimit?: string;
  }
): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] createHotspotUser on router ${routerId || 'default'}: ${params.username}`);
    return;
  }

  await withRouterConnection(routerId, async (api) => {
    // 1. Auto-create User Profile on router if missing
    const allProfiles = await safeWrite(api, ['/ip/hotspot/user/profile/print']);
    const profileExists = allProfiles.some((p: any) => p.name === params.profile);

    if (!profileExists) {
      console.log(`[RouterOS API] Creating profile '${params.profile}' on router ${routerId || 'default'}...`);
      const createProfileCmd = [
        '/ip/hotspot/user/profile/add',
        `=name=${params.profile}`,
        '=shared-users=1',
        '=add-mac-cookie=yes',
        '=mac-cookie-timeout=3d'
      ];
      if (params.rateLimit) {
        createProfileCmd.push(`=rate-limit=${params.rateLimit}`);
      }
      await safeWrite(api, createProfileCmd);
    }

    // 2. Check if user already exists
    const allUsers = await safeWrite(api, ['/ip/hotspot/user/print']);
    const existing = allUsers.filter((u: any) => u.name === params.username);
    
    if (existing.length > 0) {
      throw new Error(`Hotspot user '${params.username}' already exists on router.`);
    }

    // 3. Add user
    await safeWrite(api, [
      '/ip/hotspot/user/add',
      `=name=${params.username}`,
      `=password=${params.password}`,
      `=profile=${params.profile}`,
      `=limit-uptime=${params.limitUptime}`,
      `=comment=${params.comment || `DHOS voucher ${params.username}`}`
    ]);

    // 4. Trigger direct login if client IP is active
    if (params.ip && params.ip !== '0.0.0.0' && !params.ip.startsWith('10.10.10.')) {
      await safeWrite(api, [
        '/ip/hotspot/active/login',
        `=ip=${params.ip}`,
        `=user=${params.username}`,
        `=password=${params.password}`
      ]).catch((err) => {
        console.warn(`[RouterOS API Warning] Direct login failed for IP ${params.ip}:`, err);
      });
    }
  });

  await logRouterEvent(
    'User Created',
    `Hotspot user '${params.username}' created on router '${routerId || 'default'}'.`
  );
}

/**
 * Triggers direct login session on a specific router.
 */
export async function loginActiveHotspotUser(routerId: string | undefined, username: string, ip: string): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] loginActiveHotspotUser: ${username} on router ${routerId || 'default'}`);
    return;
  }

  await withRouterConnection(routerId, async (api) => {
    try {
      await safeWrite(api, [
        '/ip/hotspot/active/login',
        `=ip=${ip}`,
        `=user=${username}`,
        `=password=${username}`
      ]);
    } catch (err: any) {
      const errMsg = String(err.message || err).toLowerCase();
      if (errMsg.includes('already') || errMsg.includes('active')) return;
      throw err;
    }
  });
}

/**
 * Removes a hotspot user from a specific router.
 */
export async function removeHotspotUser(routerId: string | undefined, username: string): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] removeHotspotUser: ${username} on router ${routerId || 'default'}`);
    return;
  }

  await withRouterConnection(routerId, async (api) => {
    const allUsers = await safeWrite(api, ['/ip/hotspot/user/print']);
    const users = allUsers.filter((u: any) => u.name === username);
    if (users.length === 0) return;
    
    const id = users[0].id || users[0]['.id'];
    if (id) {
      await safeWrite(api, ['/ip/hotspot/user/remove', `=.id=${id}`]);
    }
  });

  await logRouterEvent('User Removed', `Hotspot user '${username}' removed from router ${routerId || 'default'}.`);
}

/**
 * Terminates an active session on a specific router.
 */
export async function disconnectHotspotSession(routerId: string | undefined, username: string): Promise<void> {
  if (isSimulationMode()) {
    console.log(`[SIMULATION] disconnectHotspotSession: ${username} on router ${routerId || 'default'}`);
    return;
  }

  await withRouterConnection(routerId, async (api) => {
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
    `Hotspot session for '${username}' terminated on router ${routerId || 'default'}.`
  );
}

/**
 * Fetches real-time router telemetry for a single router.
 */
export async function getSingleRouterHealth(routerId?: string) {
  const routerConfig = await getRouterConfig(routerId);

  if (isSimulationMode()) {
    return getSimulatedHealth(routerConfig.name || 'Simulated Router', 'Simulation Mode Enabled');
  }

  const startTime = Date.now();
  try {
    const health = await withRouterConnection(routerConfig, async (api) => {
      const [identityRes, resourceRes, activeRes, hotspotRes] = await Promise.all([
        safeWrite(api, ['/system/identity/print']),
        safeWrite(api, ['/system/resource/print']),
        safeWrite(api, ['/ip/hotspot/active/print']),
        safeWrite(api, ['/ip/hotspot/print'])
      ]);

      const identity = identityRes[0]?.name || identityRes[0]?.identity || routerConfig.name || 'MikroTik';
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
        id: routerConfig.id,
        name: routerConfig.name,
        host: routerConfig.host,
        status: 'ONLINE' as const,
        identity,
        version: `RouterOS v${version}`,
        uptime,
        cpuUsage: cpuLoad,
        memoryTotal: memTotalMB,
        memoryFree: memFreeMB,
        memoryUsage: memUsagePercent,
        connectedUsers: activeCount,
        hotspotStatus: hotspotActive,
        latencyMs: Date.now() - startTime
      };
    });

    return health;
  } catch (error: any) {
    return {
      id: routerConfig.id,
      name: routerConfig.name,
      host: routerConfig.host,
      status: 'OFFLINE' as const,
      identity: routerConfig.name || 'MikroTik',
      version: 'Unknown',
      uptime: 'Offline',
      cpuUsage: 0,
      memoryTotal: 0,
      memoryFree: 0,
      memoryUsage: 0,
      connectedUsers: 0,
      hotspotStatus: 'inactive',
      latencyMs: Date.now() - startTime,
      error: error.message || 'Connection failed'
    };
  }
}

/**
 * Legacy getRouterHealth helper for default router or primary dashboard.
 */
export async function getRouterHealth(routerId?: string) {
  return getSingleRouterHealth(routerId);
}

function getSimulatedHealth(name: string, reason?: string) {
  return {
    name,
    status: 'SIMULATED' as const,
    identity: `${name} (Simulated)`,
    version: 'RouterOS v7.12.1',
    uptime: '12d 4h 32m',
    cpuUsage: 12,
    memoryTotal: 1024,
    memoryFree: 768,
    memoryUsage: 25,
    connectedUsers: 0,
    hotspotStatus: 'active',
    latencyMs: 15,
    simulationReason: reason
  };
}

/**
 * Resolves DHCP lease device name from a specific router.
 */
export async function getLeaseDeviceName(routerId: string | undefined, macAddress: string): Promise<string> {
  if (isSimulationMode() || !macAddress) return 'Simulated Device';

  try {
    return await withRouterConnection(routerId, async (api) => {
      const leases = await safeWrite(api, ['/ip/dhcp-server/lease/print']);
      const targetMac = macAddress.trim().toUpperCase();
      const lease = leases.find((l: any) => l['mac-address']?.toUpperCase() === targetMac);
      return lease?.['host-name'] || 'Unknown Device';
    });
  } catch {
    return 'Unknown Device';
  }
}
