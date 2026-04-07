'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { SupplementCard } from '@/components/nutrition/supplement-card';
import { supplements, getSupplementsByGoal, getCoreSupplements } from '@/lib/data/supplements';
import { getUserProfile } from '@/lib/stores/user-store';
import type { Supplement, Goal } from '@/types';
import { useUserId } from '@/hooks/use-user-id';

export default function SupplementsPage() {
  const userId = useUserId();
  const [goal, setGoal] = useState<Goal>('fat_loss');
  const [recommended, setRecommended] = useState<Supplement[]>([]);

  useEffect(() => {
    if (userId) {
      getUserProfile(userId).then((profile) => {
        if (profile) {
          setGoal(profile.goal);
        }
      });
    }
  }, [userId]);

  useEffect(() => {
    const core = getCoreSupplements();
    const goalSpecific = getSupplementsByGoal(goal).filter(
      (s) => s.category !== 'core'
    );
    setRecommended([...core, ...goalSpecific]);
  }, [goal]);

  const categories = [
    { key: 'core', label: 'Essential (Start Here)' },
    { key: 'fat_loss', label: 'Fat Loss Support' },
    { key: 'recovery', label: 'Recovery' },
    { key: 'health', label: 'General Health' },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Supplements" showBack />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold">Recommended for Your Goal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on your <span className="font-medium text-primary">{goal.replace('_', ' ')}</span> goal.
            These are evidence-based supplements that may support your progress.
          </p>
        </div>

        {categories.map((cat) => {
          const catSupps = recommended.filter((s) => s.category === cat.key);
          if (catSupps.length === 0) return null;
          return (
            <section key={cat.key}>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {cat.label}
              </h2>
              <div className="space-y-3">
                {catSupps.map((supp) => (
                  <SupplementCard key={supp.id} supplement={supp} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="rounded-lg bg-muted p-4 text-center text-xs text-muted-foreground">
          Supplements are not a substitute for a balanced diet. Consult with a healthcare provider before starting any supplement regimen.
        </div>
      </div>
    </div>
  );
}
