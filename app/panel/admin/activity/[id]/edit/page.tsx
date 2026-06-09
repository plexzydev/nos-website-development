import { auth } from '@/auth';
import { db } from '@/lib/db';
import { activities, towTrucks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ArrowLeft, Wrench } from 'lucide-react';
import Link from 'next/link';
import { AdminEditActivityForm } from '@/components/panel/admin-edit-activity-form';

export default async function AdminEditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, id),
    with: { mechanic: true },
  });

  if (!activity) notFound();

  const allTowTrucks = await db.query.towTrucks.findMany();

  return (
    <div className="pt-4 max-w-2xl mx-auto">
      <Link href={`/panel/admin/user/${activity.mechanicId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver al Usuario
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Wrench className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-700 uppercase tracking-tight">Editar Actividad</h1>
            <p className="text-xs text-muted-foreground">Estás editando como administrador</p>
          </div>
        </div>

        <AdminEditActivityForm 
          activityId={activity.id}
          mechanicId={activity.mechanicId || ''}
          defaultType={activity.type || 'other'}
          defaultMatricula={activity.matricula || ''}
          defaultGrua={activity.gruaMatricula || ''}
          defaultGasoline={activity.gasoline}
          defaultBoxes={activity.boxes}
          defaultImageUrl={activity.imageUrl || ''}
          towTrucks={allTowTrucks}
        />
      </div>
    </div>
  );
}
