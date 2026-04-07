import { getDb } from '@/lib/db';
import type { WorkoutSession, PersonalRecord } from '@/types';

export async function getRecentWorkouts(userId: string, limit = 20): Promise<WorkoutSession[]> {
  return getDb(userId).workoutSessions.orderBy('date').reverse().limit(limit).toArray();
}

export async function getWorkoutById(userId: string, sessionId: string): Promise<WorkoutSession | undefined> {
  return getDb(userId).workoutSessions.where('sessionId').equals(sessionId).first();
}

export async function saveWorkout(userId: string, session: WorkoutSession): Promise<number> {
  const existing = await getDb(userId).workoutSessions.where('sessionId').equals(session.sessionId).first();
  if (existing?.id != null) {
    await getDb(userId).workoutSessions.put({ ...session, id: existing.id });
    return existing.id;
  }
  return getDb(userId).workoutSessions.add(session) as Promise<number>;
}

export async function deleteWorkout(userId: string, sessionId: string): Promise<void> {
  await getDb(userId).workoutSessions.where('sessionId').equals(sessionId).delete();
}

export async function getCompletedWorkouts(userId: string): Promise<WorkoutSession[]> {
  return getDb(userId).workoutSessions.where('completed').equals(1).reverse().sortBy('date');
}

export async function getWorkoutsByDateRange(userId: string, startDate: string, endDate: string): Promise<WorkoutSession[]> {
  return getDb(userId).workoutSessions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

// Personal Records
export async function getPersonalRecords(userId: string, exerciseId?: string): Promise<PersonalRecord[]> {
  if (exerciseId) {
    return getDb(userId).personalRecords.where('exerciseId').equals(exerciseId).toArray();
  }
  return getDb(userId).personalRecords.toArray();
}

export async function savePersonalRecord(userId: string, record: Omit<PersonalRecord, 'id'>): Promise<number> {
  return getDb(userId).personalRecords.add(record as PersonalRecord) as Promise<number>;
}

export async function getLatestPRs(userId: string): Promise<Map<string, PersonalRecord>> {
  const allPRs = await getDb(userId).personalRecords.toArray();
  const prMap = new Map<string, PersonalRecord>();

  for (const pr of allPRs) {
    const existing = prMap.get(pr.exerciseId);
    if (!existing || pr.weight * (36 / (37 - pr.reps)) > existing.weight * (36 / (37 - existing.reps))) {
      prMap.set(pr.exerciseId, pr);
    }
  }

  return prMap;
}
