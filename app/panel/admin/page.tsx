import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, warnings as warningsTable, scheduledActivities, activities, towTrucks, settings } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { createScheduledActivity, removeUser, restoreUser, toggleScheduledActivity, deleteScheduledActivity, createTowTruck, deleteTowTruck, updateRewards } from './actions';
import { Shield, Calendar, AlertTriangle, UserX, UserCheck, Clock, Users, ArrowLeft, Trash2, Power, ChevronRight, Truck, Plus, Trophy } from 'lucide-react';
import Link from 'next/link';
import { AdminWarningForm } from '@/components/panel/admin-warning-form';

const ADMIN_ROLE_ID = '1478286207447339060';

export default async function AdminPage() {
  const session = await auth();
  const discordId = session!.user!.id!;

  let isAdmin = false;
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      next: { revalidate: 0 }
    });
    if (res.ok) {
      const member = await res.json();
      isAdmin = member.roles.includes(ADMIN_ROLE_ID);
    }
  } catch {}

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-card p-8 text-center">
          <Shield className="mx-auto mb-4 size-12 text-red-500/60" />
          <h2 className="font-heading text-xl font-700 uppercase text-red-500">Sin Permisos</h2>
          <p className="mt-2 text-sm text-muted-foreground">No tenés el rol de administrador.</p>
          <Link href="/panel" className="mt-6 inline-block rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold">Volver</Link>
        </div>
      </div>
    );
  }

  const allMechanics = await db.select().from(users).where(eq(users.isMechanic, true));
  const removedUsers = await db.select().from(users).where(eq(users.isRemoved, true));

  // Count activities per mechanic
  const activityCounts = await db.select({ mechanicId: activities.mechanicId, value: count() }).from(activities).groupBy(activities.mechanicId);
  const warningCounts = await db.select({ mechanicId: warningsTable.mechanicId, value: count() }).from(warningsTable).groupBy(warningsTable.mechanicId);

  const activityMap = Object.fromEntries(activityCounts.map(c => [c.mechanicId, c.value]));
  const warningMap = Object.fromEntries(warningCounts.map(c => [c.mechanicId, c.value]));

  const recentWarnings = await db.query.warnings.findMany({
    orderBy: [desc(warningsTable.createdAt)],
    limit: 10,
    with: { mechanic: true, admin: true },
  });

  const allScheduled = await db.query.scheduledActivities.findMany({
    orderBy: [desc(scheduledActivities.createdAt)],
    with: { admin: true },
  });

  const allTowTrucks = await db.query.towTrucks.findMany({
    orderBy: [desc(towTrucks.createdAt)],
  });

  const allSettings = await db.select().from(settings);
  const reward1 = allSettings.find((s) => s.key === 'reward_1')?.value || '';
  const reward2 = allSettings.find((s) => s.key === 'reward_2')?.value || '';
  const reward3 = allSettings.find((s) => s.key === 'reward_3')?.value || '';

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
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/panel" className="flex size-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-700 uppercase tracking-tight">Panel de Admin</h1>
            <p className="text-xs text-muted-foreground">Gestión de mecánicos y actividades</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <span className="font-heading text-xs font-600 uppercase tracking-[0.25em] text-primary">Administrador</span>
        </div>
      </div>

      {/* Row 1: Schedule + Active Schedules */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Schedule Form */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Calendar className="size-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Programar Actividad Diaria</h3>
                <p className="text-xs text-muted-foreground">Se repite todos los días. Notifica al ocurrir.</p>
              </div>
            </div>
            <form action={createScheduledActivity} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="sa-title" className="font-heading text-[10px] font-600 uppercase tracking-widest text-muted-foreground">Título</label>
                  <input type="text" id="sa-title" name="title" required placeholder="Ej: Apertura del taller"
                    className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sa-time" className="font-heading text-[10px] font-600 uppercase tracking-widest text-muted-foreground">Horario Diario</label>
                  <input type="time" id="sa-time" name="dailyTime" required
                    className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [color-scheme:dark]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sa-desc" className="font-heading text-[10px] font-600 uppercase tracking-widest text-muted-foreground">Descripción (opcional)</label>
                <textarea id="sa-desc" name="description" rows={2} placeholder="Detalles de la actividad..."
                  className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
              </div>
              <button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-heading text-xs font-600 uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95">
                <Calendar className="size-4" />
                Crear Actividad Diaria
              </button>
            </form>
          </div>
        </div>

        {/* Active Schedules */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '360px' }}>
          <div className="flex items-center gap-3 mb-5 shrink-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Clock className="size-5" />
            </div>
            <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Horarios Activos</h3>
          </div>
          {allScheduled.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center">
              <Clock className="mb-2 size-5 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground/60">Sin actividades programadas</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
              {allScheduled.map(a => (
                <div key={a.id} className={`rounded-xl p-3 transition-colors ${a.isActive ? 'bg-secondary/30 hover:bg-secondary/50' : 'bg-red-500/5 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{a.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Todos los días a las <span className="font-semibold text-primary">{a.dailyTime}hs</span>
                        {' · '}{a.admin?.nickname}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <form action={toggleScheduledActivity}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="isActive" value={String(a.isActive)} />
                        <button type="submit" className={`flex size-7 items-center justify-center rounded-lg transition-colors ${a.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-secondary'}`} title={a.isActive ? 'Desactivar' : 'Activar'}>
                          <Power className="size-3.5" />
                        </button>
                      </form>
                      <form action={deleteScheduledActivity}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400" title="Eliminar">
                          <Trash2 className="size-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Warning Form + Mechanic List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Warning Form */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Aplicar Medida</h3>
              <p className="text-xs text-muted-foreground">Advertencia o Sanción (Calaveras)</p>
            </div>
          </div>
          <AdminWarningForm mechanics={allMechanics.map(m => ({ id: m.id, nickname: m.nickname }))} />
        </div>

        {/* Mechanic List — clickable to manage */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '400px' }}>
          <div className="flex items-center gap-3 mb-5 shrink-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
              <Users className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Mecánicos</h3>
              <p className="text-xs text-muted-foreground">Click para gestionar datos</p>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {allMechanics.map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <Link href={`/panel/admin/user/${m.id}`} className="group flex flex-1 items-center gap-3 rounded-xl bg-secondary/30 p-3 transition-all hover:bg-secondary/50 hover:shadow-md">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary ring-1 ring-primary/20">
                    {m.nickname?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.nickname} <span className="text-xs text-primary/70">{m.userHash}</span></p>
                    <p className="text-[10px] text-muted-foreground">
                      {activityMap[m.id] || 0} actividades · {warningMap[m.id] || 0} advertencias
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
                <form action={removeUser}>
                  <input type="hidden" name="mechanicId" value={m.id} />
                  <button type="submit" className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400" title="Remover acceso">
                    <UserX className="size-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>

          {removedUsers.length > 0 && (
            <>
              <div className="mt-4 mb-3 flex items-center gap-2 shrink-0">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Removidos</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                {removedUsers.map(m => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl bg-red-500/5 p-3 ring-1 ring-red-500/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-bold uppercase text-red-400 ring-1 ring-red-500/20">
                        {m.nickname?.charAt(0) || '?'}
                      </div>
                      <p className="truncate text-sm font-medium text-muted-foreground">{m.nickname}</p>
                    </div>
                    <form action={restoreUser}>
                      <input type="hidden" name="mechanicId" value={m.id} />
                      <button type="submit" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-green-500/10 hover:text-green-400" title="Restaurar">
                        <UserCheck className="size-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 3: Warning History + Tow Trucks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Warning History */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '300px' }}>
          <div className="flex items-center gap-3 mb-5 shrink-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Historial de Medidas</h3>
          </div>
          {recentWarnings.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center">
              <p className="text-xs text-muted-foreground/60">Sin advertencias registradas</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {recentWarnings.map(w => {
                const sStyle = getSeverityStyle(w.severity);
                const isAdvertencia = w.severity === 'advertencia' || !w.severity;
                return (
                <div key={w.id} className="flex items-start gap-3 rounded-xl bg-secondary/30 p-3">
                  <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ${sStyle}`}>
                    <AlertTriangle className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{w.mechanic?.nickname}</span>
                      <span className="text-[10px] text-muted-foreground">{isAdvertencia ? 'Advertencia' : 'Sanción'} · por {w.admin?.nickname}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {w.reason}
                      {w.fineAmount && <span className="ml-1 text-primary font-semibold">(Multa: ${w.fineAmount})</span>}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      {new Date(w.createdAt!).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Tow Trucks Management */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col" style={{ maxHeight: '300px' }}>
          <div className="flex items-center gap-3 mb-5 shrink-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <Truck className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Gestión de Grúas</h3>
              <p className="text-xs text-muted-foreground">Disponibles en el formulario</p>
            </div>
          </div>
          
          <form action={createTowTruck} className="flex gap-2 mb-4 shrink-0">
            <input type="text" name="name" required placeholder="Ej: GRUA 01" className="flex h-10 flex-1 rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 uppercase" />
            <button type="submit" className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 font-heading text-xs font-600 uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02] active:scale-95">
              <Plus className="size-3.5" /> Añadir
            </button>
          </form>

          {allTowTrucks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 text-center">
              <p className="text-xs text-muted-foreground/60">No hay grúas cargadas</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {allTowTrucks.map(truck => (
                <div key={truck.id} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-emerald-400" />
                    <span className="text-sm font-bold uppercase">{truck.name}</span>
                  </div>
                  <form action={deleteTowTruck}>
                    <input type="hidden" name="id" value={truck.id} />
                    <button type="submit" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400" title="Eliminar Grúa">
                      <Trash2 className="size-3.5" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Rewards Configuration */}
      <div className="rounded-2xl border border-border bg-card p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
            <Trophy className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-600 uppercase tracking-wider">Configurar Recompensas</h3>
            <p className="text-xs text-muted-foreground">Se muestran en el Ranking para los 3 mejores</p>
          </div>
        </div>
        <form action={updateRewards} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="r1" className="font-heading text-[10px] font-600 uppercase tracking-widest text-yellow-500">Top 1 Recompensa</label>
            <input type="text" id="r1" name="reward_1" defaultValue={reward1} placeholder="Ej: Bono de $5000"
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="r2" className="font-heading text-[10px] font-600 uppercase tracking-widest text-slate-300">Top 2 Recompensa</label>
            <input type="text" id="r2" name="reward_2" defaultValue={reward2} placeholder="Ej: Bono de $3000"
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="r3" className="font-heading text-[10px] font-600 uppercase tracking-widest text-amber-600">Top 3 Recompensa</label>
            <input type="text" id="r3" name="reward_3" defaultValue={reward3} placeholder="Ej: Bono de $1000"
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
          </div>
          <button type="submit" className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-6 font-heading text-xs font-600 uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.02] active:scale-95">
            <Trophy className="size-4" />
            Guardar Recompensas
          </button>
        </form>
      </div>
    </div>
  );
}
