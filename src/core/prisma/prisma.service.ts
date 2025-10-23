import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { withAccelerate } from '@prisma/extension-accelerate';
import { withOptimize } from '@prisma/extension-optimize';

import { isDevelopment } from '@/src/common/utils/is-environment.util';
import { config } from '@/src/core/config/config.schema';
import { PrismaClient } from '@/src/generated/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly prisma: ReturnType<typeof PrismaService.createPrismaClient>;

  constructor() {
    this.prisma = PrismaService.createPrismaClient();
  }

  private static createPrismaClient() {
    const isDev = isDevelopment();

    let client = new PrismaClient({
      log: isDev ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
      errorFormat: 'pretty',
      datasourceUrl: config.DATABASE_URL,
      omit: {
        user: {
          password: true,
          lastLogin: true,
        },
      },
    });

    const optimizeApiKey = config.OPTIMIZE_API_KEY;
    if (isDev && optimizeApiKey) {
      type ClientType = typeof client;
      client = client.$extends(withOptimize({ apiKey: optimizeApiKey })) as ClientType;
    }

    return client.$extends(withAccelerate());
  }

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
