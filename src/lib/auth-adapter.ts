import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from 'next-auth/adapters';
import { prisma } from '@/lib/prisma';

/**
 * Custom Auth.js adapter for Prisma v7.
 * The official @auth/prisma-adapter only supports Prisma <=6.
 */
export function PrismaV7Adapter(): Adapter {
  return {
    async createUser(data) {
      try {
        const user = await prisma.user.create({
          data: {
            email: data.email,
            name: data.name ?? null,
            image: data.image ?? null,
            emailVerified: data.emailVerified ?? null,
          },
        });
        return mapUser(user);
      } catch (e) {
        console.error('[auth-adapter] createUser error:', e);
        throw e;
      }
    },

    async getUser(id) {
      try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ? mapUser(user) : null;
      } catch (e) {
        console.error('[auth-adapter] getUser error:', e);
        return null;
      }
    },

    async getUserByEmail(email) {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user ? mapUser(user) : null;
      } catch (e) {
        console.error('[auth-adapter] getUserByEmail error:', e);
        return null;
      }
    },

    async getUserByAccount({ provider, providerAccountId }) {
      try {
        // Use a two-step lookup instead of compound unique (more compatible)
        const accounts = await prisma.account.findMany({
          where: { provider, providerAccountId },
        });
        if (accounts.length === 0) return null;
        const user = await prisma.user.findUnique({ where: { id: accounts[0].userId } });
        return user ? mapUser(user) : null;
      } catch (e) {
        console.error('[auth-adapter] getUserByAccount error:', e);
        return null;
      }
    },

    async updateUser(data) {
      try {
        const user = await prisma.user.update({
          where: { id: data.id },
          data: {
            name: data.name ?? undefined,
            email: data.email ?? undefined,
            image: data.image ?? undefined,
            emailVerified: data.emailVerified ?? undefined,
          },
        });
        return mapUser(user);
      } catch (e) {
        console.error('[auth-adapter] updateUser error:', e);
        throw e;
      }
    },

    async deleteUser(id) {
      try {
        await prisma.user.delete({ where: { id } });
      } catch (e) {
        console.error('[auth-adapter] deleteUser error:', e);
      }
    },

    async linkAccount(data) {
      try {
        await prisma.account.create({
          data: {
            userId: data.userId,
            type: data.type,
            provider: data.provider,
            providerAccountId: data.providerAccountId,
            refresh_token: (data.refresh_token as string) ?? null,
            access_token: (data.access_token as string) ?? null,
            expires_at: (data.expires_at as number) ?? null,
            token_type: (data.token_type as string) ?? null,
            scope: (data.scope as string) ?? null,
            id_token: (data.id_token as string) ?? null,
            session_state: (data.session_state as string) ?? null,
          },
        });
      } catch (e) {
        console.error('[auth-adapter] linkAccount error:', e);
        throw e;
      }
    },

    async unlinkAccount({ provider, providerAccountId }) {
      try {
        // Find and delete by individual fields
        const accounts = await prisma.account.findMany({
          where: { provider, providerAccountId },
        });
        if (accounts.length > 0) {
          await prisma.account.delete({ where: { id: accounts[0].id } });
        }
      } catch (e) {
        console.error('[auth-adapter] unlinkAccount error:', e);
      }
    },

    async createSession(data) {
      try {
        const session = await prisma.session.create({
          data: {
            sessionToken: data.sessionToken,
            userId: data.userId,
            expires: data.expires,
          },
        });
        return session as AdapterSession;
      } catch (e) {
        console.error('[auth-adapter] createSession error:', e);
        throw e;
      }
    },

    async getSessionAndUser(sessionToken) {
      try {
        const session = await prisma.session.findUnique({
          where: { sessionToken },
        });
        if (!session) return null;
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) return null;
        return { session: session as AdapterSession, user: mapUser(user) };
      } catch (e) {
        console.error('[auth-adapter] getSessionAndUser error:', e);
        return null;
      }
    },

    async updateSession(data) {
      try {
        const session = await prisma.session.update({
          where: { sessionToken: data.sessionToken },
          data: {
            expires: data.expires ?? undefined,
            userId: data.userId ?? undefined,
          },
        });
        return session as AdapterSession;
      } catch (e) {
        console.error('[auth-adapter] updateSession error:', e);
        throw e;
      }
    },

    async deleteSession(sessionToken) {
      try {
        await prisma.session.delete({ where: { sessionToken } });
      } catch (e) {
        console.error('[auth-adapter] deleteSession error:', e);
      }
    },

    async createVerificationToken(data) {
      try {
        const token = await prisma.verificationToken.create({
          data: {
            identifier: data.identifier,
            token: data.token,
            expires: data.expires,
          },
        });
        return token;
      } catch (e) {
        console.error('[auth-adapter] createVerificationToken error:', e);
        throw e;
      }
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const tokens = await prisma.verificationToken.findMany({
          where: { identifier, token },
        });
        if (tokens.length === 0) return null;
        await prisma.verificationToken.deleteMany({
          where: { identifier, token },
        });
        return tokens[0];
      } catch (e) {
        console.error('[auth-adapter] useVerificationToken error:', e);
        return null;
      }
    },
  };
}

// Map Prisma user to Auth.js AdapterUser
function mapUser(user: {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}): AdapterUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
  };
}
