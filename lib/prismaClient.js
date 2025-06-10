// lib/prismaClient.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'], // Optional: log untuk debugging
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;