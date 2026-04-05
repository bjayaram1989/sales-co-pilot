'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { FoodLogEntry, MealType } from '@/types';

interface MealCardProps {
  meal: MealType;
  entries: FoodLogEntry[];
  onAddFood: () => void;
  onDeleteEntry: (id: number) => void;
}

const mealIcons: Record<MealType, string> = {
  breakfast: '\u2600\uFE0F',
  lunch: '\uD83C\uDF1E',
  dinner: '\uD83C\uDF19',
  snack: '\uD83C\uDF7F',
};

const mealLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealCard({ meal, entries, onAddFood, onDeleteEntry }: MealCardProps) {
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{mealIcons[meal]}</span>
          <div>
            <h3 className="font-semibold">{mealLabels[meal]}</h3>
            {entries.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {Math.round(totalCalories)} cal &middot; {Math.round(totalProtein)}g protein
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onAddFood}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {entries.length > 0 && (
        <div className="border-t border-border">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 last:border-0"
            >
              <div className="flex-1">
                <div className="text-sm">{entry.foodName}</div>
                <div className="text-xs text-muted-foreground">
                  {entry.servings}x &middot; {Math.round(entry.calories)} cal
                </div>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{Math.round(entry.protein)}P</span>
                <span>{Math.round(entry.carbs)}C</span>
                <span>{Math.round(entry.fat)}F</span>
              </div>
              <button
                onClick={() => entry.id && onDeleteEntry(entry.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
