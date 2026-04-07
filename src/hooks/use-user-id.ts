'use client';

import { useSession } from 'next-auth/react';

/**
 * Returns a stable identifier for the current user's local data store.
 * Uses user.id from the session (set in auth.ts callbacks), with email as fallback.
 */
export function useUserId(): string | null {
  const { data: session } = useSession();
  return session?.user?.id ?? session?.user?.email ?? null;
}
