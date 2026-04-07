import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  WorkoutSession,
  PersonalRecord,
  FoodLogEntry,
  NutritionAdjustment,
  WeightEntry,
  DailyActivity,
} from '@/types';

export type FitnessDB = Dexie & {
  userProfiles: EntityTable<UserProfile, 'id'>;
  workoutSessions: EntityTable<WorkoutSession, 'id'>;
  personalRecords: EntityTable<PersonalRecord, 'id'>;
  foodLogEntries: EntityTable<FoodLogEntry, 'id'>;
  nutritionAdjustments: EntityTable<NutritionAdjustment, 'id'>;
  weightEntries: EntityTable<WeightEntry, 'id'>;
  dailyActivities: EntityTable<DailyActivity, 'id'>;
};

const dbCache = new Map<string, FitnessDB>();

export function getDb(userId: string): FitnessDB {
  const existing = dbCache.get(userId);
  if (existing) return existing;

  const db = new Dexie(`FitnessTracker_${userId}`) as FitnessDB;

  db.version(1).stores({
    userProfiles: '++id, name',
    workoutSessions: '++id, sessionId, date, splitDay, completed',
    personalRecords: '++id, exerciseId, date, weight',
    foodLogEntries: '++id, date, meal, foodItemId',
    nutritionAdjustments: '++id, date',
    weightEntries: '++id, date',
    dailyActivities: '++id, date, source',
  });

  dbCache.set(userId, db);
  return db;
}
