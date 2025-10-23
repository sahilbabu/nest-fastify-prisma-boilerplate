import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Load .env.local first, then .env as fallback
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schemas',
  typedSql: {
    path: 'prisma/sql',
  },
  migrations: {
    seed: 'ts-node prisma/seeders/index.ts',
    path: 'prisma/migrations',
  },
});
