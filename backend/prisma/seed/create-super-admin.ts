/**
 * DHOS — Create Super Admin Script
 * =================================
 * Run once on the VPS to provision the first Super Admin account.
 *
 * This script is NEVER exposed publicly — run it only from the server.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json prisma/seed/create-super-admin.ts \
 *     --email admin@deroyalhotspot.name.ng \
 *     --name "DHOS Admin" \
 *     --password "YourSecurePassword123!"
 *
 * Or interactive (prompts for password):
 *   npx ts-node --project tsconfig.json prisma/seed/create-super-admin.ts \
 *     --email admin@deroyalhotspot.name.ng --name "DHOS Admin"
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as readline from 'readline';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };
  return { email: get('--email'), name: get('--name'), password: get('--password') };
}

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (hidden) {
      process.stdout.write(question);
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      let pw = '';
      process.stdin.on('data', (ch: Buffer) => {
        const c = ch.toString('utf8');
        if (c === '\n' || c === '\r' || c === '\u0004') {
          process.stdin.setRawMode?.(false);
          process.stdout.write('\n');
          rl.close();
          resolve(pw);
        } else if (c === '\u0003') {
          process.exit();
        } else if (c === '\u007f') {
          pw = pw.slice(0, -1);
        } else {
          pw += c;
          process.stdout.write('*');
        }
      });
    } else {
      rl.question(question, ans => { rl.close(); resolve(ans.trim()); });
    }
  });
}

async function main() {
  const args = parseArgs();

  const email    = args.email    || await prompt('Super Admin email:    ');
  const fullName = args.name     || await prompt('Super Admin name:     ');
  const password = args.password || await prompt('Super Admin password: ', true);

  if (!email || !fullName || !password) {
    console.error('[ERROR] Email, name and password are all required.');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('[ERROR] Password must be at least 12 characters long.');
    process.exit(1);
  }

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.isSuperAdmin) {
      console.log(`[INFO] Super Admin ${email} already exists. No changes made.`);
    } else {
      // Promote existing user to Super Admin
      await prisma.user.update({ where: { email }, data: { isSuperAdmin: true } });
      console.log(`[OK] Promoted existing user ${email} to Super Admin.`);
    }
    return;
  }

  // Hash with Argon2id
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      isActive: true,
      isSuperAdmin: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      actorType: 'system',
      actorEmail: email,
      action: 'Super Admin Created',
      module: 'PLATFORM',
      description: `Super Admin account created for ${email} via seed script.`,
    },
  });

  console.log(`\n[OK] Super Admin created successfully!`);
  console.log(`     Email: ${email}`);
  console.log(`     ID:    ${user.id}`);
  console.log(`\nLogin at: https://platform.deroyalhotspot.name.ng/login\n`);
}

main()
  .catch(e => { console.error('[ERROR]', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
