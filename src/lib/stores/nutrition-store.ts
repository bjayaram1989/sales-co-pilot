import { getDb } from '@/lib/db';
import type { FoodLogEntry, NutritionAdjustment, WeightEntry } from '@/types';

// Food Log
export async function getFoodLogByDate(userId: string, date: string): Promise<FoodLogEntry[]> {
  return getDb(userId).foodLogEntries.where('date').equals(date).toArray();
}

export async function addFoodLogEntry(userId: string, entry: Omit<FoodLogEntry, 'id'>): Promise<number> {
  return getDb(userId).foodLogEntries.add(entry as FoodLogEntry) as Promise<number>;
}

export async function updateFoodLogEntry(userId: string, id: number, entry: Partial<FoodLogEntry>): Promise<void> {
  await getDb(userId).foodLogEntries.update(id, entry);
}

export async function deleteFoodLogEntry(userId: string, id: number): Promise<void> {
  await getDb(userId).foodLogEntries.delete(id);
}

export async function getFoodLogByDateRange(userId: string, startDate: string, endDate: string): Promise<FoodLogEntry[]> {
  return getDb(userId).foodLogEntries
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

// Weight Entries
export async function getWeightEntries(userId: string, limit = 90): Promise<WeightEntry[]> {
  return getDb(userId).weightEntries.orderBy('date').reverse().limit(limit).toArray();
}

export async function addWeightEntry(userId: string, entry: Omit<WeightEntry, 'id'>): Promise<number> {
  const existing = await getDb(userId).weightEntries.where('date').equals(entry.date).first();
  if (existing?.id != null) {
    await getDb(userId).weightEntries.update(existing.id, entry);
    return existing.id;
  }
  return getDb(userId).weightEntries.add(entry as WeightEntry) as Promise<number>;
}

export async function deleteWeightEntry(userId: string, id: number): Promise<void> {
  await getDb(userId).weightEntries.delete(id);
}

// Nutrition Adjustments
export async function getNutritionAdjustments(userId: string): Promise<NutritionAdjustment[]> {
  return getDb(userId).nutritionAdjustments.orderBy('date').reverse().toArray();
}

export async function saveNutritionAdjustment(userId: string, adjustment: Omit<NutritionAdjustment, 'id'>): Promise<number> {
  return getDb(userId).nutritionAdjustments.add(adjustment as NutritionAdjustment) as Promise<number>;
}
