'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Moon, Sun, Monitor, Save, User, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { getUserProfile, saveUserProfile } from '@/lib/stores/user-store';
import type { UserProfile, ActivityLevel, Goal, ExperienceLevel, WorkoutSplit } from '@/types';
import { cn } from '@/lib/utils';
import { useUserId } from '@/hooks/use-user-id';

const goalOptions: { value: Goal; label: string; desc: string }[] = [
  { value: 'fat_loss', label: 'Fat Loss', desc: 'Maximize fat loss, preserve muscle' },
  { value: 'muscle_gain', label: 'Muscle Gain', desc: 'Build muscle with lean surplus' },
  { value: 'recomp', label: 'Recomposition', desc: 'Lose fat and gain muscle simultaneously' },
  { value: 'maintain', label: 'Maintain', desc: 'Maintain current weight and performance' },
];

const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, minimal movement' },
  { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Intense exercise + physical job' },
];

const experienceOptions: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Less than 1 year training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1-3 years consistent training' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years serious training' },
];

const splitOptions: { value: WorkoutSplit; label: string; desc: string }[] = [
  { value: 'ppl', label: 'Push/Pull/Legs', desc: '6 days/week, high volume' },
  { value: 'upper_lower', label: 'Upper/Lower', desc: '4 days/week, balanced' },
  { value: 'full_body', label: 'Full Body', desc: '3 days/week, efficient' },
  { value: 'bro_split', label: 'Body Part Split', desc: '5 days/week, classic' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const userId = useUserId();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: 25,
    gender: 'male' as 'male' | 'female',
    heightCm: 175,
    currentWeightLbs: 175,
    targetWeightLbs: 165,
    activityLevel: 'moderate' as ActivityLevel,
    goal: 'fat_loss' as Goal,
    experienceLevel: 'intermediate' as ExperienceLevel,
    preferredSplit: 'ppl' as WorkoutSplit,
  });

  useEffect(() => {
    setMounted(true);
    if (userId) {
      getUserProfile(userId).then((profile) => {
        if (profile) {
          setForm({
            name: profile.name,
            age: profile.age,
            gender: profile.gender,
            heightCm: profile.heightCm,
            currentWeightLbs: profile.currentWeightLbs,
            targetWeightLbs: profile.targetWeightLbs,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
            experienceLevel: profile.experienceLevel,
            preferredSplit: profile.preferredSplit,
          });
        }
      });
    }
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const existing = await getUserProfile(userId);
      await saveUserProfile(userId, { ...form, id: existing?.id });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Settings"
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              saved
                ? 'bg-success/20 text-success'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Save feedback note */}
        {saved && (
          <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
            Profile saved to this device. Your data is stored locally in your browser, tied to your account.
          </div>
        )}

        {/* Profile Section */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => updateField('age', Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Gender</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => updateField('gender', g)}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        form.gender === g
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Height (cm)</label>
                <input
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => updateField('heightCm', Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Weight (lbs)</label>
                <input
                  type="number"
                  value={form.currentWeightLbs}
                  onChange={(e) => updateField('currentWeightLbs', Number(e.target.value))}
                  step="1"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Target (lbs)</label>
                <input
                  type="number"
                  value={form.targetWeightLbs}
                  onChange={(e) => updateField('targetWeightLbs', Number(e.target.value))}
                  step="1"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Goal */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-base font-semibold">Goal</h2>
          <div className="grid grid-cols-2 gap-2">
            {goalOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('goal', opt.value)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  form.goal === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className={cn('text-sm font-medium', form.goal === opt.value && 'text-primary')}>
                  {opt.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Activity Level */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-base font-semibold">Activity Level</h2>
          <div className="space-y-2">
            {activityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('activityLevel', opt.value)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  form.activityLevel === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className={cn('text-sm font-medium', form.activityLevel === opt.value && 'text-primary')}>
                  {opt.label}
                </div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-base font-semibold">Experience Level</h2>
          <div className="grid grid-cols-3 gap-2">
            {experienceOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('experienceLevel', opt.value)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  form.experienceLevel === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className={cn('text-sm font-medium', form.experienceLevel === opt.value && 'text-primary')}>
                  {opt.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Workout Split */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-base font-semibold">Preferred Split</h2>
          <div className="grid grid-cols-2 gap-2">
            {splitOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('preferredSplit', opt.value)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  form.preferredSplit === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className={cn('text-sm font-medium', form.preferredSplit === opt.value && 'text-primary')}>
                  {opt.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        {mounted && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold">Theme</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                    theme === opt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  <opt.icon className={cn('h-5 w-5', theme === opt.value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('text-sm font-medium', theme === opt.value && 'text-primary')}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Data Storage Info */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 text-base font-semibold">Data Storage</h2>
          <p className="text-sm text-muted-foreground">
            Your fitness data (profile, workouts, nutrition, weight) is stored locally in your browser, tied to your account. Data persists across sessions on this device.
          </p>
        </section>

        {/* Logout */}
        <section>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </section>

        <div className="h-4" />
      </div>
    </div>
  );
}
