export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  lastLogin: string | null;
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
  simulationReason?: string;
}

export interface DashboardStats {
  plansCount: number;
  activeVouchersCount: number;
  unusedVouchersCount: number;
  onlineUsersCount: number;
  recentActivity: ActivityLog[];
  totalIncome: number;
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
