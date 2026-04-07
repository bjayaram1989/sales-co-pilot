'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Smartphone, Copy, Check, RefreshCw, ArrowRight } from 'lucide-react';
import { getUserProfile, saveUserProfile } from '@/lib/stores/user-store';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useUserId } from '@/hooks/use-user-id';

const setupSteps = [
  {
    title: 'Open the Shortcuts app on your iPhone',
    detail: 'If you don\'t have it, download it free from the App Store.',
  },
  {
    title: 'Create a new Shortcut',
    detail: 'Tap the + button in the top right corner.',
  },
  {
    title: 'Add these actions in order:',
    detail: `
1. "Find Health Samples" → Type: Steps, Start Date: Start of Today
2. "Calculate Statistics" → Operation: Sum
3. Store result in variable "steps"
4. "Find Health Samples" → Type: Active Energy, Start Date: Start of Today
5. "Calculate Statistics" → Operation: Sum
6. Store result in variable "calories"
7. "Get Contents of URL" → Method: POST
   - URL: [Your app URL]/api/health-sync
   - Body: JSON with apiKey, date (Current Date), steps, calories
    `.trim(),
  },
  {
    title: 'Set up Automation',
    detail: 'Go to Automations tab → Personal Automation → Time of Day → 11 PM → Run this Shortcut → Turn off "Ask Before Running".',
  },
  {
    title: 'Test the connection',
    detail: 'Run the shortcut manually once to verify data arrives correctly.',
  },
];

export default function HealthSyncPage() {
  const userId = useUserId();
  const [apiKey, setApiKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.origin);
    if (userId) {
      getUserProfile(userId).then((profile) => {
        if (profile?.healthSyncApiKey) {
          setApiKey(profile.healthSyncApiKey);
        }
      });
    }
  }, [userId]);

  const generateApiKey = async () => {
    if (!userId) return;
    const key = `ftk_${generateId().replace(/-/g, '')}`;
    setApiKey(key);
    const profile = await getUserProfile(userId);
    if (profile) {
      await saveUserProfile(userId, { ...profile, healthSyncApiKey: key });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePayload = JSON.stringify({
    apiKey: apiKey || 'YOUR_API_KEY',
    date: new Date().toISOString().split('T')[0],
    steps: 8500,
    activeCalories: 350,
    restingHeartRate: 62,
    weight: 80.5,
  }, null, 2);

  return (
    <div className="min-h-screen">
      <Header title="Apple Health Sync" showBack />

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Overview */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">iOS Shortcut Integration</h2>
              <p className="text-sm text-muted-foreground">
                Automatically sync your Apple Health data every night using iOS Shortcuts.
              </p>
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold">Your API Key</h3>
          {apiKey ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all">
                {apiKey}
              </code>
              <button
                onClick={() => copyToClipboard(apiKey)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <button
              onClick={generateApiKey}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Generate API Key
            </button>
          )}
        </div>

        {/* Endpoint */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold">API Endpoint</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all">
              POST {appUrl}/api/health-sync
            </code>
            <button
              onClick={() => copyToClipboard(`${appUrl}/api/health-sync`)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <h4 className="mt-4 mb-2 text-sm font-medium text-muted-foreground">Sample JSON Body:</h4>
          <pre className="rounded-lg bg-muted p-3 font-mono text-xs overflow-x-auto">
            {samplePayload}
          </pre>
        </div>

        {/* Setup Steps */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold">Setup Guide</h3>
          <div className="space-y-4">
            {setupSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{step.title}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground whitespace-pre-line">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Entry Note */}
        <div className="rounded-lg bg-muted p-4 text-center text-xs text-muted-foreground">
          Don&apos;t have an iPhone? You can manually log steps and activity from the Analytics page.
        </div>
      </div>
    </div>
  );
}
