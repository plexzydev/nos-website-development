'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { activities, activityMentions } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { users } from '@/lib/db/schema';

const activitySchema = z.object({
  type: z.enum(['repair', 'modify', 'paint', 'tow']),
  matricula: z.string().max(10).nullable().optional(),
  imageUrl: z.string().url("URL de imagen no válida").or(z.literal('')).nullable().optional(),
  mentions: z.string().max(2000).nullable().optional(),
  gasoline: z.coerce.number().min(0).max(1000).nullable().optional(),
  boxes: z.coerce.number().min(0).max(100).nullable().optional(),
  scheduledActivityId: z.string().uuid().nullable().optional().or(z.literal('')),
  gruaMatricula: z.string().max(20).nullable().optional(),
});

export async function createActivity(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No estás autenticado");
  }

  const mechanicId = session.user.id;

  const userRecord = await db.query.users.findFirst({ where: eq(users.id, mechanicId) });
  if (!userRecord || (!userRecord.isMechanic && !userRecord.isAdmin)) {
    throw new Error('Sólo mecánicos o administradores pueden registrar actividades');
  }

  // Rate Limiting Básico (Evitar Spam)
  const lastActivity = await db.query.activities.findFirst({
    where: eq(activities.mechanicId, mechanicId),
    orderBy: [desc(activities.createdAt)],
  });

  if (lastActivity && (Date.now() - lastActivity.createdAt.getTime()) < 10000) {
    throw new Error('Estás registrando muy rápido. Esperá 10 segundos.');
  }

  const parsed = activitySchema.safeParse({
    type: formData.get('type'),
    matricula: formData.get('matricula'),
    imageUrl: formData.get('imageUrl'),
    mentions: formData.get('mentions'),
    gasoline: formData.get('gasoline'),
    boxes: formData.get('boxes'),
    scheduledActivityId: formData.get('scheduledActivityId'),
    gruaMatricula: formData.get('gruaMatricula'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const data = parsed.data;
  const activityId = randomUUID();

  if (data.type === 'tow' && !data.imageUrl) {
    throw new Error('La imagen es obligatoria para los servicios de grúa');
  }

  await db.insert(activities).values({
    id: activityId,
    mechanicId,
    type: data.type,
    matricula: data.matricula ? data.matricula.toUpperCase() : null,
    imageUrl: data.imageUrl ? data.imageUrl : null,
    scheduledActivityId: data.scheduledActivityId ? data.scheduledActivityId : null,
    gruaMatricula: data.gruaMatricula ? data.gruaMatricula.toUpperCase() : null,
    gasoline: data.gasoline || null,
    boxes: data.boxes || null,
  });

  // MentionsInput sends Discord IDs separated by commas
  if (data.mentions) {
    const mentionIds = data.mentions.split(',').map(id => id.trim()).filter(Boolean);

    if (mentionIds.length > 0) {
      await db.insert(activityMentions).values(
        mentionIds.map(userId => ({
          id: randomUUID(),
          activityId,
          mentionedUserId: userId,
        }))
      );
    }
  }

  redirect('/panel');
}
