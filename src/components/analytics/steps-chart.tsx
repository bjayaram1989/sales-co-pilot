'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { DailyActivity } from '@/types';
import { formatDateShort } from '@/lib/utils';

interface StepsChartProps {
  activities: DailyActivity[];
}

export function StepsChart({ activities }: StepsChartProps) {
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  const data = sorted.map((a) => ({
    date: formatDateShort(a.date),
    steps: a.steps,
    calories: a.activeCalories,
  }));

  if (data.length === 0) return null;

  const avgSteps = Math.round(data.reduce((sum, d) => sum + d.steps, 0) / data.length);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Daily Steps</h3>
        <span className="text-sm text-muted-foreground">Avg: {avgSteps.toLocaleString()}</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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
            width={45}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [Number(value).toLocaleString(), 'Steps']}
          />
          <ReferenceLine
            y={10000}
            stroke="var(--chart-2)"
            strokeDasharray="3 3"
            label={{ value: '10k goal', fill: 'var(--chart-2)', fontSize: 10, position: 'right' }}
          />
          <Bar dataKey="steps" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
