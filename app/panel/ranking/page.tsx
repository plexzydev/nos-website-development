import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, activities, settings } from '@/lib/db/schema';
import { eq, desc, sql, gte } from 'drizzle-orm';
import { Trophy, Wrench, Gauge, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getCurrentRankingPeriod } from '@/lib/ranking-period';
import { RankingCountdown } from '@/components/panel/ranking-countdown';

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth();
  const { tab } = await searchParams;
  const currentTab = tab || 'total'; // 'total', 'repair', 'tuning', 'maintenance'

  const allSettings = await db.select().from(settings);
  const reward1 = allSettings.find((s) => s.key === 'reward_1')?.value || '';
  const reward2 = allSettings.find((s) => s.key === 'reward_2')?.value || '';
  const reward3 = allSettings.find((s) => s.key === 'reward_3')?.value || '';

  const allMechanics = await db.select().from(users).where(eq(users.isMechanic, true));

  // Get current ranking period
  const period = await getCurrentRankingPeriod();
  const periodFilter = gte(activities.createdAt, period.start);

  // Aggregate activities per mechanic based on tab, filtered by current period
  const stats = await db
    .select({
      mechanicId: activities.mechanicId,
      count: sql<number>`cast(count(${activities.id}) as int)`
    })
    .from(activities)
    .where(currentTab !== 'total'
      ? sql`${activities.type} = ${currentTab} AND ${activities.createdAt} >= ${period.start.toISOString()}`
      : periodFilter
    )
    .groupBy(activities.mechanicId)
    .orderBy(desc(sql`count(${activities.id})`));

  // Map to mechanic data
  const ranking = stats.map((stat, index) => {
    const mechanic = allMechanics.find(m => m.id === stat.mechanicId);
    return {
      rank: index + 1,
      mechanicId: stat.mechanicId,
      nickname: mechanic?.nickname || 'Mecánico Desconocido',
      userHash: mechanic?.userHash || '',
      avatarUrl: mechanic?.avatarUrl || null,
      count: stat.count,
    };
  });

  const tabs = [
    { id: 'total', label: 'Total', icon: Trophy },
    { id: 'repair', label: 'Reparaciones', icon: Wrench },
    { id: 'tuning', label: 'Tuning', icon: Gauge },
    { id: 'maintenance', label: 'Actividades', icon: Activity },
  ];

  return (
    <div className="pt-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/panel" className="flex size-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-700 uppercase tracking-tight">Ranking de Mecánicos</h1>
            <p className="text-xs text-muted-foreground">Tabla de posiciones según trabajos realizados</p>
          </div>
        </div>
        <RankingCountdown endDateISO={period.end.toISOString()} />
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto rounded-xl border border-border bg-card p-1 hide-scrollbar">
        {tabs.map(t => {
          const isActive = currentTab === t.id;
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              href={`/panel/ranking?tab=${t.id}`}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {ranking.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="mx-auto size-8 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-semibold">Sin registros</h3>
            <p className="text-xs text-muted-foreground">No hay trabajos registrados en esta categoría aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ranking.map((row) => (
              <div key={row.mechanicId} className={`flex items-center gap-4 p-4 sm:px-6 transition-colors hover:bg-secondary/30 ${row.rank === 1 ? 'bg-amber-500/5' : ''}`}>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-700 ${
                  row.rank === 1 ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                  row.rank === 2 ? 'bg-slate-300/10 text-slate-300 ring-1 ring-slate-300/20' :
                  row.rank === 3 ? 'bg-orange-700/10 text-orange-400 ring-1 ring-orange-700/20' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  #{row.rank}
                </div>
                
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary ring-1 ring-primary/20 overflow-hidden">
                  {row.avatarUrl ? (
                    <img src={row.avatarUrl} alt={row.nickname} className="h-full w-full object-cover" />
                  ) : (
                    row.nickname.charAt(0)
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{row.nickname} <span className="text-xs text-muted-foreground">{row.userHash}</span></p>
                  {row.rank === 1 && reward1 && <p className="mt-0.5 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Premio: {reward1}</p>}
                  {row.rank === 2 && reward2 && <p className="mt-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Premio: {reward2}</p>}
                  {row.rank === 3 && reward3 && <p className="mt-0.5 text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Premio: {reward3}</p>}
                </div>
                
                <div className="flex items-center gap-2 text-right">
                  <span className="font-heading text-2xl font-700 text-primary">{row.count}</span>
                  <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:inline-block">Trabajos</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
