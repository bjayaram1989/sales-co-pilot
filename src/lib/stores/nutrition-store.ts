import { db } from '@/lib/db';
import type { FoodLogEntry, NutritionAdjustment, WeightEntry } from '@/types';

// Food Log
export async function getFoodLogByDate(date: string): Promise<FoodLogEntry[]> {
  return db.foodLogEntries.where('date').equals(date).toArray();
}

export async function addFoodLogEntry(entry: Omit<FoodLogEntry, 'id'>): Promise<number> {
  return db.foodLogEntries.add(entry as FoodLogEntry) as Promise<number>;
}

export async function updateFoodLogEntry(id: number, entry: Partial<FoodLogEntry>): Promise<void> {
  await db.foodLogEntries.update(id, entry);
}

export async function deleteFoodLogEntry(id: number): Promise<void> {
  await db.foodLogEntries.delete(id);
}

export async function getFoodLogByDateRange(startDate: string, endDate: string): Promise<FoodLogEntry[]> {
  return db.foodLogEntries
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

// Weight Entries
export async function getWeightEntries(limit = 90): Promise<WeightEntry[]> {
  return db.weightEntries.orderBy('date').reverse().limit(limit).toArray();
}

export async function addWeightEntry(entry: Omit<WeightEntry, 'id'>): Promise<number> {
  const existing = await db.weightEntries.where('date').equals(entry.date).first();
  if (existing?.id != null) {
    await db.weightEntries.update(existing.id, entry);
    return existing.id;
  }
  return db.weightEntries.add(entry as WeightEntry) as Promise<number>;
}

export async function deleteWeightEntry(id: number): Promise<void> {
  await db.weightEntries.delete(id);
}

// Nutrition Adjustments
export async function getNutritionAdjustments(): Promise<NutritionAdjustment[]> {
  return db.nutritionAdjustments.orderBy('date').reverse().toArray();
}

export async function saveNutritionAdjustment(adjustment: Omit<NutritionAdjustment, 'id'>): Promise<number> {
  return db.nutritionAdjustments.add(adjustment as NutritionAdjustment) as Promise<number>;
}
