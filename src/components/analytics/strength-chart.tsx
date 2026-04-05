'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WorkoutSession } from '@/types';
import { estimateOneRepMax } from '@/lib/algorithms/progressive-overload';
import { formatDateShort } from '@/lib/utils';

interface StrengthChartProps {
  sessions: WorkoutSession[];
}

const keyLifts = [
  { id: 'bench-press', name: 'Bench Press' },
  { id: 'squat', name: 'Squat' },
  { id: 'deadlift', name: 'Deadlift' },
  { id: 'ohp', name: 'Overhead Press' },
  { id: 'barbell-row', name: 'Barbell Row' },
];

export function StrengthChart({ sessions }: StrengthChartProps) {
  const [selectedLift, setSelectedLift] = useState(keyLifts[0].id);
  const completedSessions = sessions.filter((s) => s.completed);

  const data = completedSessions
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((session) => {
      const exercise = session.exercises.find((e) => e.exerciseId === selectedLift);
      if (!exercise) return null;

      const bestSet = exercise.sets
        .filter((s) => s.completed && s.actualWeight && s.actualReps)
        .sort((a, b) => (b.actualWeight! * b.actualReps!) - (a.actualWeight! * a.actualReps!))[0];

      if (!bestSet) return null;

      return {
        date: formatDateShort(session.date),
        weight: bestSet.actualWeight!,
        reps: bestSet.actualReps!,
        e1rm: estimateOneRepMax(bestSet.actualWeight!, bestSet.actualReps!),
      };
    })
    .filter(Boolean);

  const liftName = keyLifts.find((l) => l.id === selectedLift)?.name ?? '';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Strength Progress</h3>
      </div>

      {/* Lift Selector */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {keyLifts.map((lift) => (
          <button
            key={lift.id}
            onClick={() => setSelectedLift(lift.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedLift === lift.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {lift.name}
          </button>
        ))}
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => `${v}kg`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => {
                const v = Number(value);
                if (name === 'e1rm') return [`${v.toFixed(1)}kg`, 'Est. 1RM'];
                if (name === 'weight') return [`${v}kg`, 'Weight'];
                return [String(v), String(name)];
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--chart-1)' }}
              name="weight"
            />
            <Line
              type="monotone"
              dataKey="e1rm"
              stroke="var(--chart-5)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="e1rm"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          No data for {liftName} yet. Complete some workouts to see progress.
        </div>
      )}
    </div>
  );
}
