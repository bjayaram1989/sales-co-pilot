import Link from 'next/link';
import { Calendar, Clock, Dumbbell, Trophy, Trash2 } from 'lucide-react';
import type { WorkoutSession } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WorkoutCardProps {
  session: WorkoutSession;
  onDelete?: (sessionId: string) => void;
}

export function WorkoutCard({ session, onDelete }: WorkoutCardProps) {
  const completedExercises = session.exercises.filter(
    (e) => e.sets.every((s) => s.completed)
  ).length;
  const totalVolume = session.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((eTotal, set) => {
      if (set.completed && set.actualWeight && set.actualReps) {
        return eTotal + set.actualWeight * set.actualReps;
      }
      return eTotal;
    }, 0);
  }, 0);

  return (
    <div className="group relative">
      <Link
        href={`/workouts/${session.sessionId}`}
        className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold">{session.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(session.date)}
              </span>
              {session.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {session.duration}min
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              session.completed
                ? 'bg-success/10 text-success'
                : 'bg-warning/10 text-warning'
            )}>
              {session.completed ? 'Completed' : 'In Progress'}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Dumbbell className="h-3.5 w-3.5" />
            {completedExercises}/{session.exercises.length} exercises
          </span>
          {totalVolume > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              {(totalVolume / 1000).toFixed(1)}t volume
            </span>
          )}
          {session.isDeload && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Deload
            </span>
          )}
        </div>
      </Link>

      {/* Delete button - appears on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(session.sessionId);
          }}
          className="absolute -right-2 -top-2 hidden rounded-full border border-border bg-card p-1.5 text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground group-hover:flex"
          title="Delete workout"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
