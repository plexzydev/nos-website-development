import { Suspense } from 'react';
import { db } from '@/lib/db';
import { scheduledActivities, towTrucks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NewActivityForm } from '@/components/panel/new-activity-form';

export default async function NewActivityPage() {
  const activeScheduledActivities = await db
    .select({ id: scheduledActivities.id, title: scheduledActivities.title })
    .from(scheduledActivities)
    .where(eq(scheduledActivities.isActive, true));

  const allTowTrucks = await db
    .select({ id: towTrucks.id, name: towTrucks.name })
    .from(towTrucks)
    .orderBy(desc(towTrucks.createdAt));

  return (
    <Suspense fallback={<div className="pt-4 text-muted-foreground">Cargando...</div>}>
      <NewActivityForm scheduledActivities={activeScheduledActivities} towTrucks={allTowTrucks} />
    </Suspense>
  );
}
