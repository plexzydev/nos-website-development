import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, warnings, activities } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { deleteSingleActivity, deleteSingleWarning, removeUser } from '../../actions';
import { ArrowLeft, Wrench, Gauge, Activity, AlertTriangle, Trash2, UserX, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const ADMIN_ROLE_ID = '1478286207447339060';

export default async function AdminUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await auth();
  const discordId = session!.user!.id!;

  // Verify admin
  let isAdmin = false;
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const member = await res.json();
      isAdmin = member.roles.includes(ADMIN_ROLE_ID);
    }
  } catch {}

  if (!isAdmin) notFound();

  const mechanic = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!mechanic) notFound();

  const userActivities = await db.query.activities.findMany({
    where: eq(activities.mechanicId, userId),
    orderBy: [desc(activities.createdAt)],
    with: { mechanic: true, mentions: { with: { mentionedUser: true } } },
  });

  const userWarnings = await db.query.warnings.findMany({
    where: eq(warnings.mechanicId, userId),
    orderBy: [desc(warnings.createdAt)],
    with: { admin: true },
  });

  const typeConfig: Record<string, { label: string; color: string; icon: typeof Wrench }> = {
    repair: { label: 'Reparación', color: 'text-blue-400 bg-blue-500/10 ring-blue-500/20', icon: Wrench },
    tuning: { label: 'Tuning', color: 'text-primary bg-primary/10 ring-primary/20', icon: Gauge },
    maintenance: { label: 'Mantenimiento', color: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20', icon: Activity },
    other: { label: 'Otro', color: 'text-muted-foreground bg-secondary ring-border', icon: Wrench },
  };

  const getSeverityStyle = (severity: string | null) => {
    switch (severity) {
      case 'blanca': return 'text-muted-foreground bg-secondary ring-border';
      case 'roja': return 'text-red-500 bg-red-500/10 ring-red-500/20';
      case 'negra': return 'text-slate-900 bg-slate-900/10 ring-slate-900/20 drop-shadow-md dark:text-black dark:bg-black/50 dark:ring-black';
      case 'amarilla': return 'text-amber-400 bg-amber-500/10 ring-amber-500/20';
      case 'advertencia':
      default:
        return 'text-blue-400 bg-blue-500/10 ring-blue-500/20';
    }
  };

  return (
    <div className="pt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/panel/admin" className="flex size-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary ring-2 ring-primary/20">
            {mechanic.nickname?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-700 uppercase tracking-tight truncate">{mechanic.nickname} <span className="text-primary/70 text-sm">{mechanic.userHash}</span></h1>
            <p className="text-xs text-muted-foreground">{mechanic.id} · {userActivities.length} actividades · {userWarnings.length} advertencias</p>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activities */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '600px' }}>
          <div className="flex items-center justify-between shrink-0 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Wrench className="size-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Actividades</h3>
                <p className="text-xs text-muted-foreground">{userActivities.length} registros</p>
              </div>
            </div>
          </div>

          {userActivities.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center py-8">
              <Wrench className="mb-2 size-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Sin actividades registradas</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {userActivities.map(a => {
                const cfg = typeConfig[a.type || 'other'] || typeConfig.other;
                const Icon = cfg.icon;
                return (
                  <div key={a.id} className="group flex items-start gap-3 rounded-xl bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
                    <Link href={`/panel/admin/activity/${a.id}/edit`} className="flex flex-1 items-start gap-3 min-w-0">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${cfg.color}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{cfg.label}</p>
                            {a.matricula && <p className="mt-0.5 line-clamp-1 text-xs font-bold uppercase text-primary">{a.matricula}</p>}
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-1 ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(a.createdAt!).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                      <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <form action={deleteSingleActivity}>
                      <input type="hidden" name="activityId" value={a.id} />
                      <button type="submit" className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400" title="Eliminar">
                        <Trash2 className="size-3.5" />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Warnings */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '600px' }}>
          <div className="flex items-center justify-between shrink-0 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Medidas</h3>
                <p className="text-xs text-muted-foreground">{userWarnings.length} registros (Adv. y Sanciones)</p>
              </div>
            </div>
          </div>

          {userWarnings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center py-8">
              <AlertTriangle className="mb-2 size-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Sin advertencias — Buen mecánico</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {userWarnings.map(w => {
                const sStyle = getSeverityStyle(w.severity);
                const isAdvertencia = w.severity === 'advertencia' || !w.severity;
                return (
                <div key={w.id} className="flex items-start gap-3 rounded-xl bg-secondary/10 p-3 ring-1 ring-border">
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ${sStyle}`}>
                    <AlertTriangle className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {w.reason}
                      {w.fineAmount && <span className="ml-1 text-primary font-semibold">(Multa: ${w.fineAmount})</span>}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {isAdvertencia ? 'Advertencia' : 'Sanción'} por {w.admin?.nickname} · {new Date(w.createdAt!).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <form action={deleteSingleWarning}>
                    <input type="hidden" name="warningId" value={w.id} />
                    <button type="submit" className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400" title="Eliminar">
                      <Trash2 className="size-3.5" />
                    </button>
                  </form>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
