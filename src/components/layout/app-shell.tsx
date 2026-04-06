'use client';

import { usePathname } from 'next/navigation';
import { FloatingNav } from './floating-nav';

const hideNavPaths = ['/login'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !hideNavPaths.some((p) => pathname.startsWith(p));

  return (
    <>
      <main className={showNav ? 'pb-24' : ''}>{children}</main>
      {showNav && <FloatingNav />}
    </>
  );
}
