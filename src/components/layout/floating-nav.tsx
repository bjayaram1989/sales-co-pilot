'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Dumbbell, UtensilsCrossed, BarChart3, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/workouts', label: 'Train', icon: Dumbbell },
  { href: '/nutrition', label: 'Eat', icon: UtensilsCrossed },
  { href: '/analytics', label: 'Stats', icon: BarChart3 },
  { href: '/settings', label: 'Me', icon: Settings },
];

export function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const activeIndex = tabs.findIndex(
    (tab) => tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
  );

  // Update sliding indicator position
  useEffect(() => {
    if (!navRef.current) return;
    const buttons = navRef.current.querySelectorAll<HTMLButtonElement>('[data-nav-tab]');
    const activeBtn = buttons[Math.max(0, activeIndex)];
    if (activeBtn) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - navRect.left,
        width: btnRect.width,
      });
    }
  }, [activeIndex]);

  // Swipe gesture handling for tab switching
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      const currentIdx = Math.max(0, activeIndex);
      if (diff > 0 && currentIdx < tabs.length - 1) {
        // Swipe left -> next tab
        router.push(tabs[currentIdx + 1].href);
      } else if (diff < 0 && currentIdx > 0) {
        // Swipe right -> prev tab
        router.push(tabs[currentIdx - 1].href);
      }
    }
    setTouchStart(null);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <nav
        ref={navRef}
        className="relative flex items-center gap-1 rounded-2xl border border-border/50 bg-card/80 px-2 py-2 shadow-xl shadow-black/10 backdrop-blur-xl"
      >
        {/* Animated sliding indicator */}
        <div
          className="absolute top-2 h-[calc(100%-16px)] rounded-xl bg-primary/10 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />

        {tabs.map((tab, i) => {
          const isActive = i === activeIndex || (activeIndex === -1 && i === 0);
          return (
            <button
              key={tab.href}
              data-nav-tab
              onClick={() => router.push(tab.href)}
              className={cn(
                'relative z-10 flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                'text-[10px] font-semibold transition-all duration-200',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
