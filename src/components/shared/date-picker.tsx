'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  maxDate?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({ value, onChange, maxDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(value + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay();

  const prevMonth = () => {
    setViewDate((v) => {
      const m = v.month - 1;
      return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m };
    });
  };

  const nextMonth = () => {
    setViewDate((v) => {
      const m = v.month + 1;
      return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m };
    });
  };

  const selectDay = (day: number) => {
    const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (maxDate && dateStr > maxDate) return;
    onChange(dateStr);
    setOpen(false);
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const monthLabel = new Date(viewDate.year, viewDate.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isToday = value === todayStr;
  const displayDate = isToday
    ? 'Today'
    : new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setViewDate(() => {
            const d = new Date(value + 'T00:00:00');
            return { year: d.getFullYear(), month: d.getMonth() };
          });
          setOpen(!open);
        }}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold transition-colors hover:bg-accent"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {displayDate}
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-xl border border-border bg-card p-3 shadow-lg">
          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded-lg p-1 hover:bg-accent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">{monthLabel}</span>
            <button onClick={nextMonth} className="rounded-lg p-1 hover:bg-accent">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5">
            {DAYS.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === value;
              const isDisabled = maxDate ? dateStr > maxDate : false;
              const isTodayCell = dateStr === todayStr;

              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  disabled={isDisabled}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : isTodayCell
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-accent',
                    isDisabled && 'opacity-30 cursor-not-allowed'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick jump to today */}
          {value !== todayStr && (
            <button
              onClick={() => {
                onChange(todayStr);
                setOpen(false);
              }}
              className="mt-2 w-full rounded-lg py-1.5 text-center text-xs font-medium text-primary hover:bg-primary/10"
            >
              Go to Today
            </button>
          )}
        </div>
      )}
    </div>
  );
}
