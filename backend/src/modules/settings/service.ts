import prisma from '../../lib/prisma';
import { UpdateSettingsInput } from './validator';
import { encrypt } from '../../utils/crypto';

/**
 * Retrieves all flat system settings merged with the primary router configuration.
 */
export async function getSettings() {
  const [dbSettings, router] = await Promise.all([
    prisma.systemSetting.findMany(),
    prisma.router.findFirst()
  ]);

  const settingsMap: Record<string, string> = {};
  dbSettings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return {
    company_name: settingsMap.company_name || 'DeRoyal Hotspot',
    support_phone: settingsMap.support_phone || '',
    support_email: settingsMap.support_email || '',
    session_timeout: settingsMap.session_timeout || '3600',
    voucher_length: settingsMap.voucher_length ? parseInt(settingsMap.voucher_length, 10) : 10,
    router_host: router?.host || '',
    router_port: router?.apiPort || 8728,
    router_username: router?.username || ''
  };
}

/**
 * Updates system key-value settings and router API configuration inside a database transaction.
 */
export async function updateSettings(data: UpdateSettingsInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Update System Settings (Key-Value entries)
    if (data.company_name !== undefined) {
      await tx.systemSetting.upsert({
        where: { key: 'company_name' },
        update: { value: data.company_name },
        create: { key: 'company_name', value: data.company_name }
      });
    }

    if (data.support_phone !== undefined) {
      await tx.systemSetting.upsert({
        where: { key: 'support_phone' },
        update: { value: data.support_phone },
        create: { key: 'support_phone', value: data.support_phone }
      });
    }

    if (data.support_email !== undefined) {
      await tx.systemSetting.upsert({
        where: { key: 'support_email' },
        update: { value: data.support_email },
        create: { key: 'support_email', value: data.support_email }
      });
    }

    if (data.session_timeout !== undefined) {
      await tx.systemSetting.upsert({
        where: { key: 'session_timeout' },
        update: { value: data.session_timeout },
        create: { key: 'session_timeout', value: data.session_timeout }
      });
    }

    if (data.voucher_length !== undefined) {
      const lengthVal = String(data.voucher_length);
      await tx.systemSetting.upsert({
        where: { key: 'voucher_length' },
        update: { value: lengthVal },
        create: { key: 'voucher_length', value: lengthVal }
      });
    }

    // 2. Update Router Configuration
    const hasRouterUpdate = 
      data.router_host !== undefined || 
      data.router_port !== undefined || 
      data.router_username !== undefined || 
      data.router_password !== undefined;

    if (hasRouterUpdate) {
      const existingRouter = await tx.router.findFirst();

      const routerData: any = {};
      if (data.router_host !== undefined) routerData.host = data.router_host;
      if (data.router_port !== undefined) routerData.apiPort = data.router_port;
      if (data.router_username !== undefined) routerData.username = data.router_username;
      if (data.router_password !== undefined && data.router_password !== '') {
        routerData.encryptedPassword = encrypt(data.router_password);
      }

      if (existingRouter) {
        await tx.router.update({
          where: { id: existingRouter.id },
          data: routerData
        });
      } else {
        await tx.router.create({
          data: {
            name: 'Primary Router',
            host: data.router_host || '192.168.88.1',
            apiPort: data.router_port || 8728,
            username: data.router_username || 'admin',
            encryptedPassword: data.router_password ? encrypt(data.router_password) : '',
            status: 'OFFLINE',
            enabled: true
          }
        });
      }
    }

    // 3. Return fresh values
    const freshSettings = await tx.systemSetting.findMany();
    const freshRouter = await tx.router.findFirst();

    const freshMap: Record<string, string> = {};
    freshSettings.forEach((s) => {
      freshMap[s.key] = s.value;
    });

    return {
      company_name: freshMap.company_name || 'DeRoyal Hotspot',
      support_phone: freshMap.support_phone || '',
      support_email: freshMap.support_email || '',
      session_timeout: freshMap.session_timeout || '3600',
      voucher_length: freshMap.voucher_length ? parseInt(freshMap.voucher_length, 10) : 10,
      router_host: freshRouter?.host || '',
      router_port: freshRouter?.apiPort || 8728,
      router_username: freshRouter?.username || ''
    };
  });
}
