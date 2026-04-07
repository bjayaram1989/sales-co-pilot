'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Smartphone, Copy, Check, RefreshCw } from 'lucide-react';
import { getUserProfile, saveUserProfile } from '@/lib/stores/user-store';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function HealthSyncPage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.origin);
    getUserProfile().then((profile) => {
      if (profile?.healthSyncApiKey) {
        setApiKey(profile.healthSyncApiKey);
      }
    });
  }, []);

  const generateApiKey = async () => {
    const key = `ftk_${generateId().replace(/-/g, '')}`;
    setApiKey(key);
    const profile = await getUserProfile();
    if (profile) {
      await saveUserProfile({ ...profile, healthSyncApiKey: key });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpointUrl = `${appUrl}/api/health-sync`;

  const samplePayload = JSON.stringify({
    apiKey: apiKey || 'YOUR_API_KEY',
    date: new Date().toISOString().split('T')[0],
    steps: 8500,
    activeCalories: 350,
    restingHeartRate: 62,
    weight: 175,
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

        {/* Step 1: Generate API Key */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</div>
            <h3 className="font-semibold">Generate Your API Key</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            This key authenticates your iPhone shortcut with your FitTrack account.
          </p>
          {apiKey ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all">
                {apiKey}
              </code>
              <button
                onClick={() => copyToClipboard(apiKey, 'apiKey')}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
              >
                {copied === 'apiKey' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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

        {/* Step 2: Copy Endpoint URL */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</div>
            <h3 className="font-semibold">Copy Your Endpoint URL</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            This is the URL your iPhone shortcut will send data to.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-muted px-3 py-2 font-mono text-xs break-all">
              {endpointUrl}
            </code>
            <button
              onClick={() => copyToClipboard(endpointUrl, 'url')}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
            >
              {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Step 3: Create the iOS Shortcut */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</div>
            <h3 className="font-semibold">Create the iOS Shortcut</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Open the <strong>Shortcuts</strong> app on your iPhone and create a new shortcut with these actions:
          </p>
          <div className="space-y-3">
            <Step num="A" title="Get today's steps">
              Add <strong>&quot;Find Health Samples&quot;</strong> action. Set Type to <strong>Steps</strong>, Start Date to <strong>Start of Today</strong>. Then add <strong>&quot;Calculate Statistics&quot;</strong> and set Operation to <strong>Sum</strong>.
            </Step>
            <Step num="B" title="Get active calories">
              Add another <strong>&quot;Find Health Samples&quot;</strong> action. Set Type to <strong>Active Energy</strong>, Start Date to <strong>Start of Today</strong>. Then add <strong>&quot;Calculate Statistics&quot;</strong> (Sum).
            </Step>
            <Step num="C" title="Send data to FitTrack">
              Add <strong>&quot;Get Contents of URL&quot;</strong> action:
              <ul className="mt-2 ml-4 space-y-1 text-xs text-muted-foreground list-disc">
                <li>URL: paste your endpoint URL from Step 2</li>
                <li>Method: <strong>POST</strong></li>
                <li>Request Body: <strong>JSON</strong></li>
                <li>Add these keys:</li>
              </ul>
              <div className="mt-2">
                <pre className="rounded-lg bg-muted p-3 font-mono text-xs overflow-x-auto">
                  {samplePayload}
                </pre>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Replace the <code className="bg-muted px-1 rounded">steps</code> and <code className="bg-muted px-1 rounded">activeCalories</code> values with the variables from steps A and B.
              </p>
            </Step>
          </div>
        </div>

        {/* Step 4: Automate */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</div>
            <h3 className="font-semibold">Automate It (Optional)</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>To sync automatically every night:</p>
            <ol className="ml-4 space-y-1 list-decimal">
              <li>Go to the <strong>Automations</strong> tab in Shortcuts</li>
              <li>Tap <strong>+</strong> &rarr; <strong>Time of Day</strong></li>
              <li>Set time to <strong>11:00 PM</strong></li>
              <li>Select your new shortcut</li>
              <li>Turn off <strong>&quot;Ask Before Running&quot;</strong></li>
            </ol>
          </div>
        </div>

        {/* Step 5: Test */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">5</div>
            <h3 className="font-semibold">Test the Connection</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Run the shortcut manually once. If successful, you&apos;ll see your step count and calories appear on the Analytics page.
          </p>
        </div>

        {/* Manual Entry Note */}
        <div className="rounded-lg bg-muted p-4 text-center text-xs text-muted-foreground">
          Don&apos;t have an iPhone? You can manually log steps and activity from the Analytics page.
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">{num}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
