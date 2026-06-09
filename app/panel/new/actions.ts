'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { activities, activityMentions } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

export async function createActivity(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No estás autenticado");
  }

  const mechanicId = session.user.id;
  const type = formData.get('type') as string;
  const matricula = formData.get('matricula') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const mentionsRaw = formData.get('mentions') as string;
  
  const gasolineRaw = formData.get('gasoline') as string;
  const boxesRaw = formData.get('boxes') as string;
  const gasoline = gasolineRaw ? parseInt(gasolineRaw, 10) : null;
  const boxes = boxesRaw ? parseInt(boxesRaw, 10) : null;
  const scheduledActivityId = formData.get('scheduledActivityId') as string;
  const gruaMatricula = formData.get('gruaMatricula') as string;

  const activityId = randomUUID();

  if (type === 'tow' && !imageUrl) {
    throw new Error('La imagen es obligatoria para los servicios de grúa');
  }

  await db.insert(activities).values({
    id: activityId,
    mechanicId,
    type,
    matricula: matricula ? matricula.toUpperCase() : null,
    imageUrl: imageUrl ? imageUrl : null,
    scheduledActivityId: scheduledActivityId ? scheduledActivityId : null,
    gruaMatricula: gruaMatricula ? gruaMatricula.toUpperCase() : null,
    gasoline,
    boxes,
  });

  // MentionsInput sends Discord IDs separated by commas
  if (mentionsRaw) {
    const mentionIds = mentionsRaw.split(',').map(id => id.trim()).filter(Boolean);

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
