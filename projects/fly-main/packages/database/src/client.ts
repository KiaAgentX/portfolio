import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __fishkalPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.__fishkalPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__fishkalPrisma = prisma;
}
