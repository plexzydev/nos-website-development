import { auth } from '@/auth';
import { db } from '@/lib/db';
import { activities, users, warnings, notifications, scheduledActivities } from '@/lib/db/schema';
import { eq, desc, count, and } from 'drizzle-orm';
import { Wrench, Gauge, Clock, AlertTriangle, Bell, Activity, Plus, ChevronRight, Skull } from 'lucide-react';
import Link from 'next/link';
import { CountdownTimer } from '@/components/panel/countdown-timer';
import { DiscordNotifToggle } from '@/components/panel/discord-notif-toggle';

export const dynamic = 'force-dynamic';

export default async function PanelDashboard() {
  const session = await auth();
  const discordId = session!.user!.id!;

  const userRecord = await db.query.users.findFirst({ where: eq(users.id, discordId) });

  const [repairCount] = await db.select({ value: count() }).from(activities).where(and(eq(activities.mechanicId, discordId), eq(activities.type, 'repair')));
  const [tuningCount] = await db.select({ value: count() }).from(activities).where(and(eq(activities.mechanicId, discordId), eq(activities.type, 'tuning')));
  const [maintenanceCount] = await db.select({ value: count() }).from(activities).where(and(eq(activities.mechanicId, discordId), eq(activities.type, 'maintenance')));
  const [totalCount] = await db.select({ value: count() }).from(activities).where(eq(activities.mechanicId, discordId));
  const [warningCount] = await db.select({ value: count() }).from(warnings).where(eq(warnings.mechanicId, discordId));

  const userWarnings = await db.query.warnings.findMany({
    where: eq(warnings.mechanicId, discordId),
    orderBy: [desc(warnings.createdAt)],
    limit: 10,
    with: { admin: true },
  });

  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, discordId),
    orderBy: [desc(notifications.createdAt)],
    limit: 20,
  });
  const [unreadCount] = await db.select({ value: count() }).from(notifications).where(and(eq(notifications.userId, discordId), eq(notifications.isRead, false)));

  // All scheduled activities
  const allScheduled = await db.query.scheduledActivities.findMany({
    where: eq(scheduledActivities.isActive, true),
    orderBy: [scheduledActivities.dailyTime],
  });

  const recentActivities = await db.query.activities.findMany({
    where: eq(activities.mechanicId, discordId),
    orderBy: [desc(activities.createdAt)],
    limit: 20,
    with: { mechanic: true, mentions: { with: { mentionedUser: true } } }
  });

  const avatarUrl = session!.user!.image || null;
  const displayName = userRecord?.nickname || session!.user!.name || 'Mecánico';
  const userHash = userRecord?.userHash || '';

  return (
    <div className="space-y-6 pt-4">
      {/* Profile + Stats */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="size-16 rounded-2xl ring-2 ring-primary/30 shadow-lg shadow-primary/10" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold uppercase text-primary ring-2 ring-primary/30">{displayName.charAt(0)}</div>
              )}
              <div>
                <h2 className="font-heading text-xl font-700 uppercase tracking-tight">{displayName} <span className="text-primary/70 text-sm">{userHash}</span></h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-400 ring-1 ring-green-500/20">
                    <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                    En servicio
                  </span>
                  
                  {userWarnings.filter(w => w.severity !== 'advertencia').length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pl-1">
                      {userWarnings.filter(w => w.severity !== 'advertencia').map(w => {
                        let colorClass = 'text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]'; // amarilla
                        if (w.severity === 'blanca') colorClass = 'text-slate-300 drop-shadow-[0_0_2px_rgba(203,213,225,0.5)]';
                        if (w.severity === 'roja') colorClass = 'text-red-500 drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]';
                        if (w.severity === 'negra') colorClass = 'text-slate-900 drop-shadow-[0_0_3px_rgba(255,255,255,1)] dark:text-white dark:drop-shadow-[0_0_3px_rgba(0,0,0,1)]';
                        return <Skull key={w.id} className={`size-4 ${colorClass}`} title={`Sanción ${w.severity}`} />;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/50 p-3 text-center">
                <p className="font-heading text-2xl font-700 text-primary">{totalCount.value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Total Trabajos</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3 text-center">
                <p className={`font-heading text-2xl font-700 ${warningCount.value > 0 ? 'text-amber-400' : 'text-foreground'}`}>{warningCount.value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Advertencias</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">ID: {discordId}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute right-0 top-0 size-24 -translate-y-4 translate-x-4 rounded-full bg-blue-500/5" />
            <div className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 transition-transform group-hover:scale-110"><Wrench className="size-5" /></div>
              <p className="mt-4 font-heading text-4xl font-700 tracking-tight">{repairCount.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Reparaciones</p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute right-0 top-0 size-24 -translate-y-4 translate-x-4 rounded-full bg-primary/5" />
            <div className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110"><Gauge className="size-5" /></div>
              <p className="mt-4 font-heading text-4xl font-700 tracking-tight">{tuningCount.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Tuning</p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <div className="absolute right-0 top-0 size-24 -translate-y-4 translate-x-4 rounded-full bg-emerald-500/5" />
            <div className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 transition-transform group-hover:scale-110"><Activity className="size-5" /></div>
              <p className="mt-4 font-heading text-4xl font-700 tracking-tight">{maintenanceCount.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Actividades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer + Notifications + Warnings — fixed height, scrollable */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timer */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"><Clock className="size-5" /></div>
              <div>
                <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Próxima Actividad</h3>
                <p className="text-xs text-muted-foreground">Temporizador diario</p>
              </div>
            </div>
            <CountdownTimer activities={allScheduled} />
            <DiscordNotifToggle initialValue={userRecord?.discordNotifs ?? true} />
          </div>
        </div>

        {/* Notifications — scrollable */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '320px' }}>
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"><Bell className="size-5" /></div>
              <div>
                <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Notificaciones</h3>
                <p className="text-xs text-muted-foreground">Últimas novedades</p>
              </div>
            </div>
            {unreadCount.value > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">{unreadCount.value}</span>
            )}
          </div>
          {userNotifications.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center">
              <Bell className="mb-2 size-5 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground/70">Sin notificaciones</p>
            </div>
          ) : (
            <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {userNotifications.map(n => (
                <div key={n.id} className={`rounded-lg p-2.5 text-xs transition-colors ${n.isRead ? 'bg-secondary/20 text-muted-foreground' : 'bg-blue-500/5 text-foreground ring-1 ring-blue-500/10'}`}>
                  <p>{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">
                    {new Date(n.createdAt!).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warnings — scrollable */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '320px' }}>
          <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"><AlertTriangle className="size-5" /></div>
                <div>
                  <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Historial</h3>
                  <p className="text-xs text-muted-foreground">Advertencias y Sanciones</p>
                </div>
              </div>
            <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ring-1 ${warningCount.value > 0 ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 'bg-green-500/10 text-green-400 ring-green-500/20'}`}>{warningCount.value}</span>
          </div>
          {userWarnings.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center">
              <AlertTriangle className="mb-2 size-5 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground/70">Sin advertencias — ¡Buen trabajo!</p>
            </div>
          ) : (
            <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {userWarnings.map(w => {
                let sStyle = 'bg-amber-500/5 ring-amber-500/10';
                let tStyle = 'text-amber-400';
                const isAdvertencia = w.severity === 'advertencia' || !w.severity;

                if (w.severity === 'blanca') { sStyle = 'bg-secondary/50 ring-border'; tStyle = 'text-foreground'; }
                if (w.severity === 'roja') { sStyle = 'bg-red-500/5 ring-red-500/10'; tStyle = 'text-red-400'; }
                if (w.severity === 'negra') { sStyle = 'bg-slate-900/10 ring-slate-900/40'; tStyle = 'text-slate-900 drop-shadow-[0_0_3px_rgba(255,255,255,1)] dark:text-white dark:drop-shadow-[0_0_3px_rgba(0,0,0,1)]'; }
                if (isAdvertencia) { sStyle = 'bg-blue-500/5 ring-blue-500/10'; tStyle = 'text-blue-400'; }

                return (
                <div key={w.id} className={`flex items-start gap-3 rounded-lg p-2.5 text-xs ring-1 ${sStyle}`}>
                  {isAdvertencia ? <AlertTriangle className={`mt-0.5 size-3.5 shrink-0 ${tStyle}`} /> : <Skull className={`mt-0.5 size-3.5 shrink-0 ${tStyle}`} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground">
                      {w.reason}
                      {w.fineAmount && <span className="ml-1 text-primary font-semibold">(Multa: ${w.fineAmount})</span>}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      {isAdvertencia ? 'Advertencia' : 'Sanción'} por {w.admin?.nickname} · {new Date(w.createdAt!).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions + Recent Activity — scrollable feed */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-600 uppercase tracking-[0.2em] text-primary">Acciones Rápidas</h3>
          <div className="mt-5 space-y-3">
            <Link href="/panel/new?type=repair" className="group flex items-center gap-3 rounded-xl bg-secondary/50 p-3.5 transition-all hover:bg-secondary hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"><Wrench className="size-5" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Nueva Reparación</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Registrar trabajo</p></div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/panel/new?type=tuning" className="group flex items-center gap-3 rounded-xl bg-secondary/50 p-3.5 transition-all hover:bg-secondary hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20"><Gauge className="size-5" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Nuevo Tuning</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Modificación / upgrade</p></div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/panel/new?type=maintenance" className="group flex items-center gap-3 rounded-xl bg-secondary/50 p-3.5 transition-all hover:bg-secondary hover:shadow-md">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"><Activity className="size-5" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Actividades</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Actividades programadas</p></div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Recent Activity — scrollable */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '420px' }}>
          <div className="flex items-center justify-between shrink-0">
            <h3 className="font-heading text-sm font-600 uppercase tracking-[0.2em] text-primary">Actividad Reciente</h3>
            <Link href="/panel/new" className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95">
              <Plus className="size-3.5" />
              Nuevo
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary"><Activity className="size-7 text-muted-foreground/50" /></div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">No hay actividades recientes</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Registrá tu primer trabajo</p>
            </div>
          ) : (
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {recentActivities.map((activity) => {
                const typeConfig = {
                  repair: { label: 'Reparación', color: 'text-blue-400 bg-blue-500/10 ring-blue-500/20', icon: Wrench },
                  tuning: { label: 'Tuning', color: 'text-primary bg-primary/10 ring-primary/20', icon: Gauge },
                  maintenance: { label: 'Actividades', color: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20', icon: Activity },
                  other: { label: 'Otro', color: 'text-muted-foreground bg-secondary ring-border', icon: Wrench },
                }[activity.type || 'other'] || { label: 'Otro', color: 'text-muted-foreground bg-secondary ring-border', icon: Wrench };
                const Icon = typeConfig.icon;
                return (
                  <Link key={activity.id} href={`/panel/activity/${activity.id}`} className="group flex items-start gap-4 rounded-xl bg-secondary/30 p-4 transition-all hover:bg-secondary/60 cursor-pointer">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${typeConfig.color}`}><Icon className="size-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold">{typeConfig.label}</h4>
                        {activity.matricula && <span className="shrink-0 text-sm font-bold uppercase tracking-wider text-primary">{activity.matricula}</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground">{new Date(activity.createdAt!).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
