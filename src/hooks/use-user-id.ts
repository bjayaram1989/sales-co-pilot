'use client';

import { useSession } from 'next-auth/react';

/**
 * Returns the authenticated user's ID, or null if not signed in.
 * All data operations should be gated on this being non-null.
 */
export function useUserId(): string | null {
  const { data: session } = useSession();
  return session?.user?.id ?? null;
}
