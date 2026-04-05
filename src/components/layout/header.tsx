'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function Header({ title, showBack = false, action, className }: HeaderProps) {
  const router = useRouter();

  return (
    <header className={cn('sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-sm', className)}>
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  );
}
