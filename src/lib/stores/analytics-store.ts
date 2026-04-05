import { db } from '@/lib/db';
import type { DailyActivity } from '@/types';

export async function getDailyActivities(limit = 90): Promise<DailyActivity[]> {
  return db.dailyActivities.orderBy('date').reverse().limit(limit).toArray();
}

export async function addDailyActivity(activity: Omit<DailyActivity, 'id'>): Promise<number> {
  const existing = await db.dailyActivities.where('date').equals(activity.date).first();
  if (existing?.id != null) {
    await db.dailyActivities.update(existing.id, activity);
    return existing.id;
  }
  return db.dailyActivities.add(activity as DailyActivity) as Promise<number>;
}

export async function getDailyActivityByDate(date: string): Promise<DailyActivity | undefined> {
  return db.dailyActivities.where('date').equals(date).first();
}

export async function getActivitiesByDateRange(startDate: string, endDate: string): Promise<DailyActivity[]> {
  return db.dailyActivities
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}
