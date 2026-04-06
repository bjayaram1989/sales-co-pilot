'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { WeightEntry } from '@/types';
import { formatDateShort } from '@/lib/utils';

interface WeightChartProps {
  entries: WeightEntry[];
  targetWeight?: number;
}

export function WeightChart({ entries, targetWeight }: WeightChartProps) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const data = sorted.map((entry, i) => {
    // Calculate 7-day moving average
    const window = sorted.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((sum, e) => sum + e.weightLbs, 0) / window.length;

    return {
      date: formatDateShort(entry.date),
      weight: entry.weightLbs,
      trend: Math.round(avg * 10) / 10,
    };
  });

  if (data.length === 0) return null;

  const minW = Math.min(...data.map((d) => d.weight)) - 1;
  const maxW = Math.max(...data.map((d) => d.weight)) + 1;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Weight Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--chart-1)' }}
            name="Weight (lbs)"
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="7-day average"
          />
          {targetWeight && (
            <ReferenceLine
              y={targetWeight}
              stroke="var(--chart-3)"
              strokeDasharray="3 3"
              label={{ value: 'Target', fill: 'var(--chart-3)', fontSize: 11 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
