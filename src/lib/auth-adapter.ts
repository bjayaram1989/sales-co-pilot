import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from 'next-auth/adapters';
import { prisma } from '@/lib/prisma';

/**
 * Custom Auth.js adapter for Prisma v7.
 * The official @auth/prisma-adapter only supports Prisma <=6.
 */
export function PrismaV7Adapter(): Adapter {
  return {
    async createUser(data) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name ?? null,
          image: data.image ?? null,
          emailVerified: data.emailVerified ?? null,
        },
      });
      return mapUser(user);
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? mapUser(user) : null;
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? mapUser(user) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
      if (!account) return null;
      const user = await prisma.user.findUnique({ where: { id: account.userId } });
      return user ? mapUser(user) : null;
    },

    async updateUser(data) {
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
    },

    async deleteUser(id) {
      await prisma.user.delete({ where: { id } });
    },

    async linkAccount(data) {
      await prisma.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token ?? null,
          access_token: data.access_token ?? null,
          expires_at: data.expires_at ?? null,
          token_type: data.token_type ?? null,
          scope: data.scope ?? null,
          id_token: data.id_token ?? null,
          session_state: data.session_state as string | null ?? null,
        },
      });
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
    },

    async createSession(data) {
      const session = await prisma.session.create({
        data: {
          sessionToken: data.sessionToken,
          userId: data.userId,
          expires: data.expires,
        },
      });
      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
      });
      if (!session) return null;
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return null;
      return { session: session as AdapterSession, user: mapUser(user) };
    },

    async updateSession(data) {
      const session = await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data: {
          expires: data.expires ?? undefined,
          userId: data.userId ?? undefined,
        },
      });
      return session as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
    },

    async createVerificationToken(data) {
      const token = await prisma.verificationToken.create({
        data: {
          identifier: data.identifier,
          token: data.token,
          expires: data.expires,
        },
      });
      return token;
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const vt = await prisma.verificationToken.findUnique({
          where: { identifier_token: { identifier, token } },
        });
        if (!vt) return null;
        await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
        return vt;
      } catch {
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
