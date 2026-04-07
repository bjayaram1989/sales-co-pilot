import { getDb } from '@/lib/db';
import type { UserProfile } from '@/types';

export async function getUserProfile(userId: string): Promise<UserProfile | undefined> {
  return getDb(userId).userProfiles.toCollection().first();
}

export async function saveUserProfile(userId: string, profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Promise<number> {
  const now = new Date().toISOString();
  const existing = await getUserProfile(userId);

  if (existing?.id) {
    await getDb(userId).userProfiles.update(existing.id, { ...profile, updatedAt: now });
    return existing.id;
  }

  return getDb(userId).userProfiles.add({ ...profile, createdAt: now, updatedAt: now } as UserProfile) as Promise<number>;
}

export async function updateUserWeight(userId: string, weightLbs: number): Promise<void> {
  const profile = await getUserProfile(userId);
  if (profile?.id) {
    await getDb(userId).userProfiles.update(profile.id, {
      currentWeightLbs: weightLbs,
      updatedAt: new Date().toISOString(),
    });
  }
}
