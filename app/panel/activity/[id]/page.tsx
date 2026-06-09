import { auth } from '@/auth';
import { db } from '@/lib/db';
import { activities, activityMentions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Wrench, Gauge, Activity, ArrowLeft, Calendar, Users, ImageIcon, Hash, Truck } from 'lucide-react';
import Link from 'next/link';
import { SafeImage } from '@/components/safe-image';

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, id),
    with: {
      mechanic: true,
      mentions: { with: { mentionedUser: true } },
      scheduledActivity: true,
    },
  });

  if (!activity) notFound();

  const typeConfig: Record<string, { label: string; color: string; icon: typeof Wrench }> = {
    repair: { label: 'Reparación', color: 'text-blue-400 bg-blue-500/10 ring-blue-500/20', icon: Wrench },
    tuning: { label: 'Tuning', color: 'text-primary bg-primary/10 ring-primary/20', icon: Gauge },
    maintenance: { label: 'Actividades', color: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20', icon: Activity },
    tow: { label: 'Grúa', color: 'text-amber-500 bg-amber-500/10 ring-amber-500/20', icon: Truck },
    other: { label: 'Otro', color: 'text-muted-foreground bg-secondary ring-border', icon: Wrench },
  };

  const config = typeConfig[activity.type || 'other'] || typeConfig.other;
  const Icon = config.icon;

  return (
    <div className="pt-4 max-w-3xl mx-auto">
      <Link href="/panel" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver al Dashboard
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header gradient */}
        <div className="relative h-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <div className={`flex size-12 items-center justify-center rounded-xl ring-1 ${config.color}`}>
              <Icon className="size-6" />
            </div>
            <div>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${config.color}`}>{config.label}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          <h1 className="font-heading text-2xl font-700 uppercase tracking-tight">{config.label}</h1>

          {/* Meta grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span className="text-[10px] uppercase tracking-widest">Fecha</span>
              </div>
              <p className="mt-1 text-sm font-semibold">
                {new Date(activity.createdAt!).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="size-3.5" />
                <span className="text-[10px] uppercase tracking-widest">Matrícula</span>
              </div>
              <p className="mt-1 text-sm font-semibold uppercase text-primary">
                {activity.matricula || '—'}
              </p>
            </div>

            {activity.gruaMatricula && (
              <div className="rounded-xl bg-secondary/50 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Hash className="size-3.5" />
                  <span className="text-[10px] uppercase tracking-widest">Grúa</span>
                </div>
                <p className="mt-1 text-sm font-semibold uppercase text-primary">
                  {activity.gruaMatricula}
                </p>
              </div>
            )}
            
            {activity.scheduledActivity && (
              <div className="rounded-xl bg-secondary/50 p-3 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span className="text-[10px] uppercase tracking-widest">Actividad Programada</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {activity.scheduledActivity.title}
                </p>
              </div>
            )}

            <div className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wrench className="size-3.5" />
                <span className="text-[10px] uppercase tracking-widest">Mecánico</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{activity.mechanic?.nickname || '—'}</p>
            </div>

            {activity.gasoline !== null && (
              <div className="rounded-xl bg-secondary/50 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Activity className="size-3.5" />
                  <span className="text-[10px] uppercase tracking-widest">Gasolina</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-emerald-400">{activity.gasoline} L</p>
              </div>
            )}

            {activity.boxes !== null && (
              <div className="rounded-xl bg-secondary/50 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Activity className="size-3.5" />
                  <span className="text-[10px] uppercase tracking-widest">Cajas</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-emerald-400">{activity.boxes}</p>
              </div>
            )}
            
            <div className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-3.5" />
                <span className="text-[10px] uppercase tracking-widest">Menciones</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{activity.mentions?.length || 0}</p>
            </div>
          </div>

          {/* Images */}
          {activity.imageUrl && (
            <div className="mt-6">
              <p className="text-[10px] font-600 uppercase tracking-widest text-muted-foreground mb-2">
                {activity.imageUrl.includes(',') ? 'Imágenes' : 'Imagen'}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {activity.imageUrl.split(',').filter(Boolean).map((url, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-border">
                    <SafeImage src={url} alt={`${config.label} ${i + 1}`} className="w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentions */}
          {activity.mentions && activity.mentions.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-600 uppercase tracking-widest text-muted-foreground mb-2">Mecánicos Mencionados</p>
              <div className="flex flex-wrap gap-2">
                {activity.mentions.map(mention => (
                  <span key={mention.id} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                    @{mention.mentionedUser?.nickname || mention.mentionedUserId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-6 border-t border-border/40 pt-4">
            <p className="text-[10px] text-muted-foreground">
              Creado el {new Date(activity.createdAt!).toLocaleString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
