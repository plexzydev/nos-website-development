'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/panel', label: 'Dashboard', exact: true },
  { href: '/panel/new', label: 'Nueva Actividad', exact: false },
  { href: '/panel/ranking', label: 'Ranking', exact: false },
];

export function PanelNav({ isAdmin, avatarUrl, displayName, userHash }: { isAdmin: boolean, avatarUrl: string | null, displayName: string, userHash?: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {LINKS.map(link => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
              active
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            )}
          >
            {link.label}
          </Link>
        );
      })}

      {isAdmin && (
        <Link
          href="/panel/admin"
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
            pathname.startsWith('/panel/admin')
              ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
              : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
          )}
        >
          <Shield className="size-3.5" />
          Admin
        </Link>
      )}

      <div className="ml-2 h-6 w-px bg-border" />

      <div className="ml-1 flex items-center gap-3">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-bold uppercase leading-none">{displayName} <span className="text-primary/70">{userHash}</span></span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{isAdmin ? 'Administrador' : 'Mecánico'}</span>
        </div>
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="size-8 rounded-full ring-2 ring-primary/30" />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary ring-2 ring-primary/30">
            {displayName.charAt(0)}
          </div>
        )}
      </div>

      <Link
        href="/api/auth/signout"
        className="ml-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        title="Cerrar sesión"
      >
        <LogOut className="size-4" />
      </Link>
    </nav>
  );
}
