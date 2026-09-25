export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  lastLogin: string | null;
}

export interface RouterItem {
  id: string;
  name: string;
  description?: string | null;
  host: string;
  apiPort: number;
  apiSsl: boolean;
  username: string;
  routerIdentity?: string | null;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN';
  enabled: boolean;
  lastSeenAt?: string | null;
  lastHealthCheckAt?: string | null;
  lastConnected?: string | null;
  latencyMs?: number | null;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    vouchers?: number;
    hotspotSessions?: number;
  };
}

export interface BandwidthProfile {
  id: string;
  name: string;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikQueueName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
  durationUnit: string;
  price: number;
  bandwidthProfileId: string;
  bandwidthProfile?: BandwidthProfile;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Voucher {
  id: string;
  code: string;
  planId: string;
  routerId?: string | null;
  router?: {
    id: string;
    name: string;
    host: string;
    status?: string;
  } | null;
  plan?: {
    id: string;
    name: string;
    price: number;
    duration: number;
    durationUnit: string;
    bandwidthProfile?: {
      name: string;
      downloadSpeed: string;
      uploadSpeed: string;
    };
  };
  status: 'UNUSED' | 'ACTIVE' | 'EXPIRED' | 'DISABLED';
  generatedBy?: string | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  activatedIp?: string | null;
  activatedMac?: string | null;
  mikrotikUsername?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HotspotSession {
  id: string;
  voucherId: string;
  routerId?: string | null;
  router?: {
    id: string;
    name: string;
    host: string;
    status?: string;
  } | null;
  username: string;
  ipAddress: string;
  macAddress: string;
  loginTime: string | null;
  logoutTime: string | null;
  sessionDuration: number | null;
  status: 'ONLINE' | 'OFFLINE' | 'EXPIRED' | 'DISCONNECTED';
  createdAt: string;
  voucher?: {
    code: string;
    plan?: {
      name: string;
    };
  };
}

export interface RouterTelemetry {
  id?: string;
  name?: string;
  host?: string;
  status: 'ONLINE' | 'OFFLINE' | 'SIMULATED';
  identity?: string;
  version?: string;
  uptime?: string;
  cpuUsage?: number;
  memoryTotal?: number;
  memoryFree?: number;
  memoryUsage?: number;
  connectedUsers?: number;
  hotspotStatus?: string;
  latencyMs?: number;
  simulationReason?: string;
  error?: string;
}

export interface DashboardStats {
  plansCount: number;
  activeVouchersCount: number;
  unusedVouchersCount: number;
  onlineUsersCount: number;
  totalIncome: number;
  totalRouters?: number;
  onlineRoutersCount?: number;
  offlineRoutersCount?: number;
  routersSummary?: RouterItem[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  adminId?: string | null;
  admin?: {
    fullName: string;
    email: string;
  } | null;
  action: string;
  module: string;
  description: string;
  ipAddress?: string | null;
  createdAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}
