import type { FoodLogEntry, NutritionAdjustment, WeightEntry } from '@/types';

// Food Log
export async function getFoodLogByDate(date: string): Promise<FoodLogEntry[]> {
  const res = await fetch(`/api/fitness/food-log?date=${date}`);
  if (!res.ok) return [];
  return res.json();
}

export async function addFoodLogEntry(entry: Omit<FoodLogEntry, 'id'>): Promise<void> {
  await fetch('/api/fitness/food-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}

export async function updateFoodLogEntry(id: string, entry: Partial<FoodLogEntry>): Promise<void> {
  await fetch('/api/fitness/food-log', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...entry }),
  });
}

export async function deleteFoodLogEntry(id: string): Promise<void> {
  await fetch(`/api/fitness/food-log?id=${id}`, { method: 'DELETE' });
}

export async function getFoodLogByDateRange(startDate: string, endDate: string): Promise<FoodLogEntry[]> {
  const res = await fetch(`/api/fitness/food-log?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) return [];
  return res.json();
}

// Weight Entries
export async function getWeightEntries(limit = 90): Promise<WeightEntry[]> {
  const res = await fetch(`/api/fitness/weight?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

export async function addWeightEntry(entry: Omit<WeightEntry, 'id'>): Promise<void> {
  await fetch('/api/fitness/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}

export async function deleteWeightEntry(id: string): Promise<void> {
  await fetch(`/api/fitness/weight?id=${id}`, { method: 'DELETE' });
}

// Nutrition Adjustments
export async function getNutritionAdjustments(): Promise<NutritionAdjustment[]> {
  const res = await fetch('/api/fitness/nutrition-adjustments');
  if (!res.ok) return [];
  return res.json();
}

export async function saveNutritionAdjustment(adjustment: Omit<NutritionAdjustment, 'id'>): Promise<void> {
  await fetch('/api/fitness/nutrition-adjustments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adjustment),
  });
}
