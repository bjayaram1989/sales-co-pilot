'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ExerciseItem } from '@/components/workouts/exercise-item';
import { Timer, CheckCircle2, Clock } from 'lucide-react';
import { getWorkoutById, saveWorkout, savePersonalRecord, getPersonalRecords } from '@/lib/stores/workout-store';
import { checkPersonalRecord } from '@/lib/algorithms/progressive-overload';
import type { WorkoutSession, WorkoutSet, PersonalRecord } from '@/types';
import { cn } from '@/lib/utils';

export default function WorkoutSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [restTarget, setRestTarget] = useState(0);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
    loadPRs();
  }, [id]);

  // Elapsed time counter
  useEffect(() => {
    if (session?.completed) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, session?.completed]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer <= 0) return;
    const interval = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer]);

  const loadSession = async () => {
    const s = await getWorkoutById(id);
    setSession(s ?? null);
    setLoading(false);
  };

  const loadPRs = async () => {
    const allPRs = await getPersonalRecords();
    setPrs(allPRs);
  };

  const handleUpdateSets = useCallback(async (exerciseIndex: number, sets: WorkoutSet[]) => {
    if (!session) return;

    const updatedSession = { ...session };
    updatedSession.exercises = [...session.exercises];
    updatedSession.exercises[exerciseIndex] = {
      ...session.exercises[exerciseIndex],
      sets,
    };

    // Check if a set was just completed - start rest timer
    const exercise = updatedSession.exercises[exerciseIndex];
    const justCompleted = sets.find(
      (s, i) => s.completed && !session.exercises[exerciseIndex].sets[i]?.completed
    );
    if (justCompleted) {
      setRestTarget(exercise.restSeconds);
      setRestTimer(exercise.restSeconds);

      // Check for PR
      if (justCompleted.actualWeight && justCompleted.actualReps) {
        const isPR = checkPersonalRecord(
          exercise.exerciseId,
          justCompleted.actualWeight,
          justCompleted.actualReps,
          prs,
        );
        if (isPR) {
          await savePersonalRecord({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            weight: justCompleted.actualWeight,
            reps: justCompleted.actualReps,
            date: session.date,
            sessionId: session.sessionId,
          });
          loadPRs();
        }
      }
    }

    setSession(updatedSession);
    await saveWorkout(updatedSession);
  }, [session, prs]);

  const handleFinish = async () => {
    if (!session) return;
    const duration = Math.round(elapsed / 60);
    const completed = {
      ...session,
      completed: true,
      duration,
    };
    setSession(completed);
    await saveWorkout(completed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <Header title="Workout Not Found" showBack />
        <div className="p-8 text-center text-muted-foreground">
          This workout session could not be found.
        </div>
      </div>
    );
  }

  const allCompleted = session.exercises.every((e) =>
    e.sets.every((s) => s.completed)
  );

  return (
    <div className="min-h-screen">
      <Header
        title={session.name}
        showBack
        action={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(elapsed)}
          </div>
        }
      />

      {/* Rest Timer Overlay */}
      {restTimer > 0 && (
        <div className="sticky top-14 z-30 border-b border-border bg-primary/10 px-4 py-3">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Rest Timer</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">{formatTime(restTimer)}</span>
              <button
                onClick={() => setRestTimer(0)}
                className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/30"
              >
                Skip
              </button>
            </div>
          </div>
          <div className="mx-auto mt-2 max-w-lg">
            <div className="h-1.5 rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${restTarget > 0 ? (restTimer / restTarget) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-lg space-y-4 p-4">
        {session.isDeload && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm text-primary">
            <strong>Deload Week</strong> - Reduced volume and weight for recovery. Focus on form and mind-muscle connection.
          </div>
        )}

        {session.exercises.map((exercise, i) => (
          <ExerciseItem
            key={exercise.exerciseId + i}
            exercise={exercise}
            onUpdateSets={(sets) => handleUpdateSets(i, sets)}
          />
        ))}

        {/* Finish Workout */}
        {!session.completed ? (
          <button
            onClick={handleFinish}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-colors',
              allCompleted
                ? 'bg-success text-white hover:bg-success/90'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            <CheckCircle2 className="h-5 w-5" />
            {allCompleted ? 'Finish Workout' : 'Finish Early'}
          </button>
        ) : (
          <div className="rounded-xl bg-success/10 border border-success/20 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h3 className="mt-3 text-lg font-bold">Workout Complete!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Duration: {session.duration} minutes
            </p>
            <button
              onClick={() => router.push('/workouts')}
              className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to Workouts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
