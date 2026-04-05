import { Footprints, Flame, Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ActivityInsight } from '@/lib/algorithms/activity-analyzer';
import { cn } from '@/lib/utils';

interface ActivitySummaryProps {
  insight: ActivityInsight;
}

const trendIcons = {
  increasing: TrendingUp,
  decreasing: TrendingDown,
  stable: Minus,
};

const trendColors = {
  increasing: 'text-success',
  decreasing: 'text-destructive',
  stable: 'text-muted-foreground',
};

const categoryLabels = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  active: 'Active',
};

export function ActivitySummary({ insight }: ActivitySummaryProps) {
  const TrendIcon = trendIcons[insight.trend];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Activity Overview</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Footprints className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-2 text-lg font-bold">{insight.averageSteps.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Avg Steps</div>
        </div>
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/10">
            <Flame className="h-5 w-5 text-chart-4" />
          </div>
          <div className="mt-2 text-lg font-bold">{insight.averageActiveCalories}</div>
          <div className="text-xs text-muted-foreground">Active Cal</div>
        </div>
        <div className="text-center">
          <div className={cn('mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted')}>
            <TrendIcon className={cn('h-5 w-5', trendColors[insight.trend])} />
          </div>
          <div className="mt-2 text-lg font-bold">{insight.trendPercent > 0 ? '+' : ''}{insight.trendPercent}%</div>
          <div className="text-xs text-muted-foreground">Trend</div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {categoryLabels[insight.category]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
      </div>
    </div>
  );
}
