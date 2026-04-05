'use client';

import { useState } from 'react';
import { Smartphone, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react';
import { addDailyActivity } from '@/lib/stores/analytics-store';
import { toDateString } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  lastSyncDate?: string;
  apiKey?: string;
}

export function SyncStatus({ lastSyncDate, apiKey }: SyncStatusProps) {
  const [showManual, setShowManual] = useState(false);
  const [manualSteps, setManualSteps] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [saving, setSaving] = useState(false);

  const isRecent = lastSyncDate && (
    new Date().getTime() - new Date(lastSyncDate).getTime() < 48 * 60 * 60 * 1000
  );

  const handleManualSave = async () => {
    setSaving(true);
    try {
      await addDailyActivity({
        date: toDateString(),
        steps: parseInt(manualSteps) || 0,
        activeCalories: parseInt(manualCalories) || 0,
        source: 'manual',
      });
      setShowManual(false);
      setManualSteps('');
      setManualCalories('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isRecent ? 'bg-success/10' : lastSyncDate ? 'bg-warning/10' : 'bg-muted'
          )}>
            <Smartphone className={cn(
              'h-5 w-5',
              isRecent ? 'text-success' : lastSyncDate ? 'text-warning' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Apple Health Sync</h3>
            {lastSyncDate ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {isRecent ? (
                  <CheckCircle2 className="h-3 w-3 text-success" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-warning" />
                )}
                Last sync: {new Date(lastSyncDate).toLocaleDateString()}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Not configured</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
        >
          <Plus className="h-3 w-3" />
          Manual Entry
        </button>
      </div>

      {showManual && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-background p-3">
          <h4 className="text-sm font-medium">Add Today&apos;s Activity</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Steps</label>
              <input
                type="number"
                value={manualSteps}
                onChange={(e) => setManualSteps(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Active Calories</label>
              <input
                type="number"
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                placeholder="e.g. 350"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <button
            onClick={handleManualSave}
            disabled={saving}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {saving ? 'Saving...' : 'Save Activity'}
          </button>
        </div>
      )}

      {!apiKey && (
        <div className="mt-3 rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            Set up automatic Apple Health sync via iOS Shortcuts in{' '}
            <a href="/settings/health-sync" className="font-medium text-primary underline">Settings</a>.
          </p>
        </div>
      )}
    </div>
  );
}
