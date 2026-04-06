'use client';

import { Check, Minus, Plus } from 'lucide-react';
import type { WorkoutSet } from '@/types';
import { cn } from '@/lib/utils';

interface SetLoggerProps {
  set: WorkoutSet;
  onUpdate: (set: WorkoutSet) => void;
  isPR?: boolean;
}

export function SetLogger({ set, onUpdate, isPR = false }: SetLoggerProps) {
  const weight = set.actualWeight ?? set.targetWeight;
  const reps = set.actualReps ?? set.targetReps;

  const adjustWeight = (delta: number) => {
    onUpdate({ ...set, actualWeight: Math.max(0, weight + delta) });
  };

  const adjustReps = (delta: number) => {
    onUpdate({ ...set, actualReps: Math.max(0, reps + delta) });
  };

  const toggleComplete = () => {
    onUpdate({
      ...set,
      completed: !set.completed,
      actualWeight: weight,
      actualReps: reps,
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        set.completed
          ? 'border-success/30 bg-success/5'
          : 'border-border',
        isPR && set.completed && 'border-warning/30 bg-warning/5'
      )}
    >
      <span className="w-6 text-center text-sm font-medium text-muted-foreground">
        {set.setNumber}
      </span>

      {/* Weight */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjustWeight(-5)}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="number"
          value={weight}
          onChange={(e) => onUpdate({ ...set, actualWeight: Number(e.target.value) })}
          className="w-16 rounded border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:ring-1 focus:ring-ring"
          step="5"
        />
        <button
          onClick={() => adjustWeight(5)}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <Plus className="h-3 w-3" />
        </button>
        <span className="text-xs text-muted-foreground">lbs</span>
      </div>

      {/* Reps */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjustReps(-1)}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="number"
          value={reps}
          onChange={(e) => onUpdate({ ...set, actualReps: Number(e.target.value) })}
          className="w-12 rounded border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={() => adjustReps(1)}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <Plus className="h-3 w-3" />
        </button>
        <span className="text-xs text-muted-foreground">reps</span>
      </div>

      {/* Complete Button */}
      <button
        onClick={toggleComplete}
        className={cn(
          'ml-auto flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
          set.completed
            ? 'border-success bg-success text-white'
            : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
        )}
      >
        <Check className="h-4 w-4" />
      </button>

      {isPR && set.completed && (
        <span className="text-xs font-bold text-warning">PR!</span>
      )}
    </div>
  );
}
