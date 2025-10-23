import { config } from 'dotenv';

import { PrismaClient } from '../../src/generated/client';

import { usersSeeder } from './users.seeder';

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

async function seeder(): Promise<void> {
  await usersSeeder(prisma);
}

seeder()
  .catch(e => {
    // eslint-disable-next-line no-console
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
