'use client';

import { cn } from '@/lib/utils';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MacroRing({ label, current, target, unit = 'g', color, size = 'md' }: MacroRingProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isOver = current > target;

  const sizes = {
    sm: { ring: 60, stroke: 5, text: 'text-sm', subtext: 'text-xs' },
    md: { ring: 80, stroke: 6, text: 'text-lg', subtext: 'text-xs' },
    lg: { ring: 120, stroke: 8, text: 'text-2xl', subtext: 'text-sm' },
  };

  const { ring, stroke, text, subtext } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg width={ring} height={ring} className="-rotate-90">
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted/50"
          />
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            stroke={isOver ? 'var(--destructive)' : color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', text)}>{Math.round(current)}</span>
        </div>
      </div>
      <span className={cn('font-medium text-muted-foreground', subtext)}>{label}</span>
      <span className={cn('text-muted-foreground', subtext)}>
        {Math.round(target - current) > 0 ? `${Math.round(target - current)}${unit} left` : isOver ? `${Math.round(current - target)}${unit} over` : 'Hit target!'}
      </span>
    </div>
  );
}
