import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

function createFallbackDb() {
  const emptySelectChain = () => ({
    from: () => ({
      where: () => [],
      orderBy: () => [],
    }),
    where: () => [],
    orderBy: () => [],
  });

  return {
    select: emptySelectChain,
    insert: () => ({
      values: async () => undefined,
    }),
    delete: () => ({
      where: async () => undefined,
    }),
    update: () => ({
      set: () => ({
        where: async () => undefined,
      }),
    }),
    query: {
      events: {
        findFirst: async () => null,
      },
      attendees: {
        findMany: async () => [],
      },
    },
  } as any;
}

if (!hasDatabaseUrl) {
  console.warn('DATABASE_URL is not set. Falling back to a no-op database client.');
}

const sql = hasDatabaseUrl ? neon(process.env.DATABASE_URL!) : null;
export const db = hasDatabaseUrl ? drizzle(sql as any, { schema }) : createFallbackDb();