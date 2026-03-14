// lib/prismaClient.js
import { PrismaClient } from '@prisma/client';

// Force UTF-8 encoding for PostgreSQL on Windows
process.env.PGCLIENTENCODING = 'UTF8';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;