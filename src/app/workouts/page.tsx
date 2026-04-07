'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { WorkoutCard } from '@/components/workouts/workout-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Dumbbell, Plus, History, Sparkles } from 'lucide-react';
import { getRecentWorkouts, saveWorkout } from '@/lib/stores/workout-store';
import { getUserProfile } from '@/lib/stores/user-store';
import { generateNextWorkout } from '@/lib/algorithms/workout-generator';
import type { WorkoutSession } from '@/types';
import Link from 'next/link';

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const sessions = await getRecentWorkouts(20);
      setWorkouts(sessions);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWorkout = async () => {
    setGenerating(true);
    try {
      const profile = await getUserProfile();
      if (!profile) {
        router.push('/settings');
        return;
      }
      const recentSessions = await getRecentWorkouts(10);
      const newWorkout = generateNextWorkout(profile, recentSessions);
      await saveWorkout(newWorkout);
      router.push(`/workouts/${newWorkout.sessionId}`);
    } catch (err) {
      console.error('Failed to generate workout:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Find today's incomplete workout
  const today = new Date().toISOString().split('T')[0];
  const todayWorkout = workouts.find((w) => w.date === today && !w.completed);
  const completedWorkouts = workouts.filter((w) => w.completed);
  const incompleteWorkouts = workouts.filter((w) => !w.completed && w.date !== today);

  return (
    <div className="min-h-screen">
      <Header
        title="Workouts"
        action={
          <Link
            href="/workouts/history"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <History className="h-4 w-4" />
            History
          </Link>
        }
      />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Generate Workout Button */}
        <button
          onClick={handleGenerateWorkout}
          disabled={generating}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
        >
          {generating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          <span className="font-semibold">
            {generating ? 'Generating...' : 'Generate Next Workout'}
          </span>
        </button>

        {/* Today's Workout */}
        {todayWorkout && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Today
            </h2>
            <WorkoutCard session={todayWorkout} />
          </section>
        )}

        {/* Incomplete Workouts */}
        {incompleteWorkouts.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              In Progress
            </h2>
            <div className="space-y-3">
              {incompleteWorkouts.map((session) => (
                <WorkoutCard key={session.sessionId} session={session} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Completed */}
        {completedWorkouts.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recent
            </h2>
            <div className="space-y-3">
              {completedWorkouts.slice(0, 5).map((session) => (
                <WorkoutCard key={session.sessionId} session={session} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && workouts.length === 0 && (
          <EmptyState
            icon={Dumbbell}
            title="No workouts yet"
            description="Generate your first workout plan based on your goals and preferred split. Make sure to set up your profile first!"
            action={
              <button
                onClick={handleGenerateWorkout}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Generate Workout
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
