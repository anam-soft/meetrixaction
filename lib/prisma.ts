import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a mock Prisma client for build time
const createPrismaClient = () => {
  // During build time, if DATABASE_URL is not available, return a mock client
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, using mock Prisma client for build')
    return new Proxy({} as PrismaClient, {
      get: () => {
        return new Proxy(() => {}, {
          apply: () => Promise.resolve(null),
          get: () => createPrismaClient()
        })
      }
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
