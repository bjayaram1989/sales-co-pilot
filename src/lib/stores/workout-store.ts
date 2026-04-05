import { db } from '@/lib/db';
import type { WorkoutSession, PersonalRecord } from '@/types';

export async function getRecentWorkouts(limit = 20): Promise<WorkoutSession[]> {
  return db.workoutSessions.orderBy('date').reverse().limit(limit).toArray();
}

export async function getWorkoutById(sessionId: string): Promise<WorkoutSession | undefined> {
  return db.workoutSessions.where('sessionId').equals(sessionId).first();
}

export async function saveWorkout(session: WorkoutSession): Promise<number> {
  const existing = await db.workoutSessions.where('sessionId').equals(session.sessionId).first();
  if (existing?.id != null) {
    await db.workoutSessions.put({ ...session, id: existing.id });
    return existing.id;
  }
  return db.workoutSessions.add(session) as Promise<number>;
}

export async function deleteWorkout(sessionId: string): Promise<void> {
  await db.workoutSessions.where('sessionId').equals(sessionId).delete();
}

export async function getCompletedWorkouts(): Promise<WorkoutSession[]> {
  return db.workoutSessions.where('completed').equals(1).reverse().sortBy('date');
}

export async function getWorkoutsByDateRange(startDate: string, endDate: string): Promise<WorkoutSession[]> {
  return db.workoutSessions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

// Personal Records
export async function getPersonalRecords(exerciseId?: string): Promise<PersonalRecord[]> {
  if (exerciseId) {
    return db.personalRecords.where('exerciseId').equals(exerciseId).toArray();
  }
  return db.personalRecords.toArray();
}

export async function savePersonalRecord(record: Omit<PersonalRecord, 'id'>): Promise<number> {
  return db.personalRecords.add(record as PersonalRecord) as Promise<number>;
}

export async function getLatestPRs(): Promise<Map<string, PersonalRecord>> {
  const allPRs = await db.personalRecords.toArray();
  const prMap = new Map<string, PersonalRecord>();

  for (const pr of allPRs) {
    const existing = prMap.get(pr.exerciseId);
    if (!existing || pr.weight * (36 / (37 - pr.reps)) > existing.weight * (36 / (37 - existing.reps))) {
      prMap.set(pr.exerciseId, pr);
    }
  }

  return prMap;
}
