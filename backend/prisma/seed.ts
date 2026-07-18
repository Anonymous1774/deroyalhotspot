import { PrismaClient, AdminRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Super Admin
  const adminEmail = 'admin@deroyalhotspot.name.ng';
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash('DeRoyalAdmin2026!');
    await prisma.admin.create({
      data: {
        fullName: 'Super Administrator',
        email: adminEmail,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
        isActive: true
      }
    });
    console.log('Super Admin seeded successfully.');
  } else {
    console.log('Super Admin already exists.');
  }

  // 2. Seed Bandwidth Profiles
  const profiles = [
    { name: 'Bronze', downloadSpeed: '5M', uploadSpeed: '2M', mikrotikQueueName: 'bronze_queue' },
    { name: 'Silver', downloadSpeed: '10M', uploadSpeed: '5M', mikrotikQueueName: 'silver_queue' },
    { name: 'Gold', downloadSpeed: '20M', uploadSpeed: '10M', mikrotikQueueName: 'gold_queue' }
  ];

  for (const prof of profiles) {
    const existingProfile = await prisma.bandwidthProfile.findUnique({
      where: { name: prof.name }
    });

    if (!existingProfile) {
      await prisma.bandwidthProfile.create({
        data: prof
      });
      console.log(`Bandwidth Profile '${prof.name}' seeded.`);
    } else {
      console.log(`Bandwidth Profile '${prof.name}' already exists.`);
    }
  }

  // Retrieve seeded profiles for linking plans
  const dbBronze = await prisma.bandwidthProfile.findUnique({ where: { name: 'Bronze' } });
  const dbSilver = await prisma.bandwidthProfile.findUnique({ where: { name: 'Silver' } });
  const dbGold = await prisma.bandwidthProfile.findUnique({ where: { name: 'Gold' } });

  // 3. Seed Plans
  if (dbBronze && dbSilver && dbGold) {
    const plans = [
      { name: '1 Hour Regular', price: 100, duration: 60, durationUnit: 'minutes', bandwidthProfileId: dbBronze.id },
      { name: '3 Hours Premium', price: 250, duration: 180, durationUnit: 'minutes', bandwidthProfileId: dbSilver.id },
      { name: '24 Hours Day Pass', price: 500, duration: 1, durationUnit: 'days', bandwidthProfileId: dbSilver.id },
      { name: '7 Days Mega', price: 2500, duration: 7, durationUnit: 'days', bandwidthProfileId: dbGold.id }
    ];

    for (const plan of plans) {
      const existingPlan = await prisma.plan.findFirst({
        where: { name: plan.name }
      });

      if (!existingPlan) {
        await prisma.plan.create({
          data: plan
        });
        console.log(`Internet Plan '${plan.name}' seeded.`);
      } else {
        console.log(`Internet Plan '${plan.name}' already exists.`);
      }
    }
  }

  // 4. Seed System Settings
  const settings = [
    { key: 'company_name', value: 'DeRoyal Hotspot' },
    { key: 'support_phone', value: '+234 701 774 1881' },
    { key: 'support_email', value: 'support@deroyalhotspot.name.ng' },
    { key: 'session_timeout', value: '3600' },
    { key: 'voucher_length', value: '10' }
  ];

  for (const set of settings) {
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key: set.key }
    });

    if (!existingSetting) {
      await prisma.systemSetting.create({
        data: set
      });
      console.log(`System Setting '${set.key}' seeded.`);
    } else {
      console.log(`System Setting '${set.key}' already exists.`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
