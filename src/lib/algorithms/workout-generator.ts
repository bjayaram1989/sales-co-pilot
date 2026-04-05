import type { UserProfile, WorkoutSession, WorkoutExercise, WorkoutSet } from '@/types';
import { getWorkoutPlan, getNextWorkoutTemplate } from '@/lib/data/workout-templates';
import { getExerciseById } from '@/lib/data/exercises';
import { shouldDeload, applyDeload, calculateProgression } from './progressive-overload';
import { generateId, getWeekNumber } from '@/lib/utils';

export function generateNextWorkout(
  profile: UserProfile,
  recentSessions: WorkoutSession[],
): WorkoutSession {
  const plan = getWorkoutPlan(profile.preferredSplit);
  if (!plan) {
    throw new Error(`Unknown split: ${profile.preferredSplit}`);
  }

  // Determine which template to use next
  const lastSession = recentSessions.find(s => s.completed);
  const template = getNextWorkoutTemplate(profile.preferredSplit, lastSession?.splitDay);
  if (!template) {
    throw new Error('No workout template available');
  }

  const today = new Date();
  const weekNumber = getWeekNumber(today);
  const isDeload = shouldDeload(weekNumber);

  const exercises: WorkoutExercise[] = template.exercises.map(templateExercise => {
    const exerciseInfo = getExerciseById(templateExercise.exerciseId);
    const exerciseType = exerciseInfo?.type ?? 'compound';

    // Find last weight used for this exercise
    let lastWeight = getLastWeight(templateExercise.exerciseId, recentSessions);

    // If no history, estimate starting weight based on experience
    if (lastWeight === 0) {
      lastWeight = estimateStartingWeight(templateExercise.exerciseId, profile.experienceLevel, profile.gender);
    }

    // Calculate progression
    const progression = calculateProgression(
      templateExercise.exerciseId,
      exerciseType,
      lastWeight,
      templateExercise.reps,
      recentSessions,
    );

    let targetWeight = progression.newWeight;
    let sets = templateExercise.sets;
    let reps = templateExercise.reps;

    // Apply deload if needed
    if (isDeload) {
      const deloaded = applyDeload(targetWeight, sets);
      targetWeight = deloaded.weight;
      sets = deloaded.sets;
    }

    // Adjust for fat loss goal: slightly higher reps, shorter rest
    let restSeconds = templateExercise.restSeconds;
    if (profile.goal === 'fat_loss') {
      reps = Math.min(reps + 2, 15);
      restSeconds = Math.max(restSeconds - 15, 45);
    }

    const workoutSets: WorkoutSet[] = Array.from({ length: sets }, (_, i) => ({
      setNumber: i + 1,
      targetReps: reps,
      targetWeight: targetWeight,
      completed: false,
    }));

    return {
      exerciseId: templateExercise.exerciseId,
      exerciseName: exerciseInfo?.name ?? templateExercise.exerciseId,
      sets: workoutSets,
      restSeconds,
      isSuperset: templateExercise.isSuperset,
      supersetWith: templateExercise.supersetWith,
    };
  });

  return {
    sessionId: generateId(),
    date: today.toISOString().split('T')[0],
    name: isDeload ? `${template.name} (Deload)` : template.name,
    splitDay: template.splitDay,
    exercises,
    completed: false,
    weekNumber,
    isDeload,
  };
}

function getLastWeight(exerciseId: string, sessions: WorkoutSession[]): number {
  for (const session of sessions) {
    const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      const completedSets = exercise.sets.filter(s => s.completed && s.actualWeight);
      if (completedSets.length > 0) {
        return completedSets[0].actualWeight!;
      }
      return exercise.sets[0].targetWeight;
    }
  }
  return 0;
}

function estimateStartingWeight(exerciseId: string, experience: string, gender: string): number {
  // Base weights for a beginner male (in kg)
  const baseWeights: Record<string, number> = {
    'bench-press': 40, 'incline-bench': 35, 'db-bench-press': 14, 'incline-db-press': 12,
    'ohp': 25, 'db-shoulder-press': 10, 'arnold-press': 8,
    'squat': 40, 'front-squat': 30, 'goblet-squat': 12,
    'deadlift': 50, 'rdl': 40, 'db-rdl': 14,
    'barbell-row': 35, 'db-row': 14, 'pull-up': 0,
    'barbell-curl': 15, 'db-curl': 8, 'hammer-curl': 8,
    'tricep-pushdown': 15, 'overhead-extension': 10, 'skull-crusher': 15,
    'leg-press': 60, 'leg-curl': 20, 'leg-extension': 20,
    'hip-thrust': 40, 'standing-calf-raise': 30, 'seated-calf-raise': 20,
    'lateral-raise': 5, 'front-raise': 5, 'reverse-fly': 5, 'face-pull': 10,
    'cable-crossover': 10, 'cable-curl': 10, 'cable-row': 25, 'lat-pulldown': 30,
    'close-grip-bench': 30, 'rope-pushdown': 12, 'cable-kickback': 5,
    'pec-deck': 20, 'machine-chest-press': 25, 'machine-shoulder-press': 20,
    'machine-row': 25, 'straight-arm-pulldown': 15,
    'bulgarian-split': 10, 'lunge': 10, 'hack-squat': 40,
    'cable-pull-through': 15, 'cable-kickback-glute': 8, 'step-up': 8,
    'seated-leg-curl': 20, 'good-morning': 20, 'incline-curl': 6,
    'preacher-curl': 12, 'concentration-curl': 6, 'cable-lateral-raise': 5,
    'upright-row': 20, 't-bar-row': 25,
  };

  let weight = baseWeights[exerciseId] ?? 10;

  // Adjust for experience
  if (experience === 'intermediate') weight *= 1.5;
  if (experience === 'advanced') weight *= 2;

  // Adjust for gender
  if (gender === 'female') weight *= 0.6;

  return Math.round(weight * 2) / 2; // Round to nearest 0.5
}

export function getWorkoutSplitDescription(split: string): string {
  const descriptions: Record<string, string> = {
    ppl: 'Push/Pull/Legs - 6 days/week. High volume, great for intermediate+.',
    upper_lower: 'Upper/Lower - 4 days/week. Balanced frequency, good for all levels.',
    full_body: 'Full Body - 3 days/week. Efficient, great for beginners.',
    bro_split: 'Body Part Split - 5 days/week. Each muscle group once per week.',
  };
  return descriptions[split] ?? '';
}
