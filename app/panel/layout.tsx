import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Wrench, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { NosLogo } from '@/components/nos-logo';
import { PanelNav } from '@/components/panel/panel-nav';

const MECHANIC_ROLE_ID = '1478275468666077205';
const ADMIN_ROLE_ID = '1478286207447339060';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin');
  }

  const discordId = session.user.id;

  // 1. Verify in DB if the account is linked
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, discordId)
  });

  if (!userRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative max-w-md rounded-2xl border border-red-500/20 bg-card p-8 text-center shadow-2xl shadow-red-500/5">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <Wrench className="size-8 text-red-500" />
          </div>
          <h2 className="font-heading text-2xl font-700 uppercase tracking-tight text-red-500">Acceso Denegado</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Tu cuenta de Discord no está vinculada. Ejecutá <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-primary">/linkaccount</code> en nuestro servidor de Discord y volvé a intentar.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/" className="flex-1 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/80">Inicio</Link>
            <Link href="/api/auth/signout" className="flex-1 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary">Cerrar sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if removed
  if (userRecord.isRemoved) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative max-w-md rounded-2xl border border-red-500/20 bg-card p-8 text-center shadow-2xl shadow-red-500/5">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <Wrench className="size-8 text-red-500" />
          </div>
          <h2 className="font-heading text-2xl font-700 uppercase tracking-tight text-red-500">Acceso Revocado</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Un administrador ha revocado tu acceso al panel de mecánico. Contactá a la administración si creés que es un error.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/" className="flex-1 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/80">Inicio</Link>
            <Link href="/api/auth/signout" className="flex-1 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary">Cerrar sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Verify roles in Discord (with retry logic and fallback to DB)
  let hasRole = userRecord.isMechanic || false;
  let isAdmin = userRecord.isAdmin || false;
  
  const fetchDiscordRoles = async (maxRetries = 2) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}`, {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
          next: { revalidate: 0 }
        });

        if (res.ok) {
          const member = await res.json();
          return {
            hasRole: member.roles.includes(MECHANIC_ROLE_ID),
            isAdmin: member.roles.includes(ADMIN_ROLE_ID),
            nickname: member.nick || member.user.global_name || member.user.username,
            success: true
          };
        } else if (res.status === 404) {
          // Member not found in guild - they may have been removed
          return { hasRole: false, isAdmin: false, nickname: null, success: false };
        }
        // For other errors, retry
      } catch (error) {
        console.error(`Attempt ${attempt + 1} to fetch Discord roles failed:`, error);
        if (attempt < maxRetries - 1) {
          // Wait before retrying
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }
    return null; // All retries failed
  };

  const discordRoles = await fetchDiscordRoles();
  
  if (discordRoles && discordRoles.success) {
    hasRole = discordRoles.hasRole;
    isAdmin = discordRoles.isAdmin;
    
    const currentNickname = discordRoles.nickname;

    // Sync to DB
    if (hasRole !== userRecord.isMechanic || isAdmin !== userRecord.isAdmin || currentNickname !== userRecord.nickname) {
      await db.update(users).set({ isMechanic: hasRole, isAdmin, nickname: currentNickname }).where(eq(users.id, discordId));
      userRecord.nickname = currentNickname;
    }
  } else if (discordRoles && !discordRoles.success) {
    // Discord API call succeeded but member not found - they're not in the guild
    hasRole = false;
    isAdmin = false;
  } else {
    // Discord API calls failed - use DB as fallback but warn about potential staleness
    console.warn(`All attempts to fetch Discord roles failed for ${discordId}, using DB fallback`);
    // In this case, keep using userRecord.isMechanic and userRecord.isAdmin
  }

  // If no role at all, deny access
  if (!hasRole && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative max-w-md rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-2xl shadow-primary/5">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Wrench className="size-8 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-700 uppercase tracking-tight text-primary">No sos Mecánico</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No tenés el rol de mecánico en el servidor de Discord. Si creés que esto es un error, contactá a la administración.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/" className="flex-1 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/80">Inicio</Link>
            <Link href="/api/auth/signout" className="flex-1 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary">Cerrar sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = session.user.image || null;
  const displayName = userRecord.nickname || session.user.name || 'Mecánico';
  const userHash = userRecord.userHash || '';

  return (
    <div className="min-w-screen min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <NosLogo />
            </Link>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <span className="hidden font-heading text-xs font-600 uppercase tracking-[0.25em] text-primary sm:block">Panel Mecánico</span>
          </div>

          <PanelNav isAdmin={isAdmin} avatarUrl={avatarUrl} displayName={displayName} userHash={userHash} />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6">
        {children}
      </main>
    </div>
  );
}
