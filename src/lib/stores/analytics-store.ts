import { getDb } from '@/lib/db';
import type { DailyActivity } from '@/types';

export async function getDailyActivities(userId: string, limit = 90): Promise<DailyActivity[]> {
  return getDb(userId).dailyActivities.orderBy('date').reverse().limit(limit).toArray();
}

export async function addDailyActivity(userId: string, activity: Omit<DailyActivity, 'id'>): Promise<number> {
  const existing = await getDb(userId).dailyActivities.where('date').equals(activity.date).first();
  if (existing?.id != null) {
    await getDb(userId).dailyActivities.update(existing.id, activity);
    return existing.id;
  }
  return getDb(userId).dailyActivities.add(activity as DailyActivity) as Promise<number>;
}

export async function getDailyActivityByDate(userId: string, date: string): Promise<DailyActivity | undefined> {
  return getDb(userId).dailyActivities.where('date').equals(date).first();
}

export async function getActivitiesByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyActivity[]> {
  return getDb(userId).dailyActivities
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}
