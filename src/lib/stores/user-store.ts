import { db } from '@/lib/db';
import type { UserProfile } from '@/types';

export async function getUserProfile(): Promise<UserProfile | undefined> {
  return db.userProfiles.toCollection().first();
}

export async function saveUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Promise<number> {
  const now = new Date().toISOString();
  const existing = await getUserProfile();

  if (existing?.id) {
    await db.userProfiles.update(existing.id, { ...profile, updatedAt: now });
    return existing.id;
  }

  return db.userProfiles.add({ ...profile, createdAt: now, updatedAt: now } as UserProfile) as Promise<number>;
}

export async function updateUserWeight(weightLbs: number): Promise<void> {
  const profile = await getUserProfile();
  if (profile?.id) {
    await db.userProfiles.update(profile.id, {
      currentWeightLbs: weightLbs,
      updatedAt: new Date().toISOString(),
    });
  }
}
