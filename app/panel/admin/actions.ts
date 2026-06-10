'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { scheduledActivities, warnings, users, notifications, activities, activityMentions, towTrucks, settings } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

const ADMIN_ROLE_ID = '1478286207447339060';

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('No autenticado');

  const discordId = session.user.id;

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, discordId)
  });

  if (!userRecord?.isAdmin) throw new Error('No sos admin');

  return discordId;
}

// ─── Create Scheduled Activity (daily recurring) ─────────────────────
export async function createScheduledActivity(formData: FormData) {
  const adminId = await verifyAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dailyTime = formData.get('dailyTime') as string;

  if (!title || !dailyTime) throw new Error('Título y horario son requeridos');

  await db.insert(scheduledActivities).values({
    id: randomUUID(),
    adminId,
    title,
    description: description || null,
    dailyTime,
  });

  redirect('/panel/admin');
}

// ─── Toggle Scheduled Activity ───────────────────────────────────────
export async function toggleScheduledActivity(formData: FormData) {
  await verifyAdmin();
  const id = formData.get('id') as string;
  const currentActive = formData.get('isActive') === 'true';
  await db.update(scheduledActivities).set({ isActive: !currentActive }).where(eq(scheduledActivities.id, id));
  redirect('/panel/admin');
}

// ─── Delete Scheduled Activity ───────────────────────────────────────
export async function deleteScheduledActivity(formData: FormData) {
  await verifyAdmin();
  const id = formData.get('id') as string;
  await db.delete(scheduledActivities).where(eq(scheduledActivities.id, id));
  revalidatePath('/panel/admin');
  revalidatePath('/panel');
}

export async function createTowTruck(formData: FormData) {
  await verifyAdmin();
  const name = formData.get('name') as string;
  await db.insert(towTrucks).values({
    id: randomUUID(),
    name: name.toUpperCase(),
  });
  revalidatePath('/panel/admin');
  revalidatePath('/panel/new');
}

export async function deleteTowTruck(formData: FormData) {
  await verifyAdmin();
  const truckId = formData.get('truckId') as string;
  if (!truckId) return;

  await db.delete(towTrucks).where(eq(towTrucks.id, truckId));
  revalidatePath('/panel/admin');
}

export async function updateRewards(formData: FormData) {
  await verifyAdmin();
  const reward1 = formData.get('reward_1') as string || '';
  const reward2 = formData.get('reward_2') as string || '';
  const reward3 = formData.get('reward_3') as string || '';

  // Upsert settings
  await db.insert(settings).values({ key: 'reward_1', value: reward1 }).onConflictDoUpdate({ target: settings.key, set: { value: reward1 } });
  await db.insert(settings).values({ key: 'reward_2', value: reward2 }).onConflictDoUpdate({ target: settings.key, set: { value: reward2 } });
  await db.insert(settings).values({ key: 'reward_3', value: reward3 }).onConflictDoUpdate({ target: settings.key, set: { value: reward3 } });

  revalidatePath('/panel/admin');
  revalidatePath('/panel/ranking');
}

// ─── Create Warning ──────────────────────────────────────────────────
export async function createWarning(formData: FormData) {
  const adminId = await verifyAdmin();
  const mechanicId = formData.get('mechanicId') as string;
  const reason = formData.get('reason') as string;
  const severity = formData.get('severity') as string || 'amarilla';
  const fineAmount = formData.get('fineAmount') as string;

  if (!mechanicId || !reason) throw new Error('Mecánico y razón son requeridos');

  const isAdvertencia = severity === 'advertencia';
  const msgLabel = isAdvertencia ? 'Advertencia' : `Sanción (${severity})`;
  const embedTitle = isAdvertencia ? '⚠️ Advertencia — NOS' : '⚠️ Sanción — NOS';

  let finalReason = reason;
  let inAppMessage = `⚠️ Has recibido una ${msgLabel}: "${reason}"`;
  
  if (!isAdvertencia && fineAmount) {
    finalReason += `\n\n**Multa a Pagar**: $${fineAmount}`;
    inAppMessage += ` (Multa: $${fineAmount})`;
  }

  await db.insert(warnings).values({ 
    id: randomUUID(), 
    mechanicId, 
    adminId, 
    reason, 
    severity, 
    fineAmount: isAdvertencia ? null : (fineAmount || null) 
  });
  await db.insert(notifications).values({ id: randomUUID(), userId: mechanicId, message: inAppMessage });

  try {
    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: mechanicId }),
    });
    if (dmRes.ok) {
      const dmChannel = await dmRes.json();
      await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [{ title: embedTitle, description: finalReason, color: isAdvertencia ? 0x3b82f6 : 0xFF4444, footer: { text: 'NOS · Panel de Mecánico' } }] }),
      });
    }
  } catch (e) { console.error('Error DM advertencia:', e); }

  redirect('/panel/admin');
}

// ─── Remove User ─────────────────────────────────────────────────────
export async function removeUser(formData: FormData) {
  await verifyAdmin();
  const mechanicId = formData.get('mechanicId') as string;
  if (!mechanicId) throw new Error('ID requerido');
  await db.update(users).set({ isRemoved: true, isMechanic: false }).where(eq(users.id, mechanicId));
  await db.insert(notifications).values({ id: randomUUID(), userId: mechanicId, message: '🚫 Tu acceso al panel ha sido revocado por un administrador.' });
  redirect('/panel/admin');
}

// ─── Restore User ────────────────────────────────────────────────────
export async function restoreUser(formData: FormData) {
  await verifyAdmin();
  const mechanicId = formData.get('mechanicId') as string;
  if (!mechanicId) throw new Error('ID requerido');
  await db.update(users).set({ isRemoved: false }).where(eq(users.id, mechanicId));
  redirect('/panel/admin');
}

// ─── Delete Single Activity ──────────────────────────────────────────
export async function deleteSingleActivity(formData: FormData) {
  await verifyAdmin();
  const activityId = formData.get('activityId') as string;
  if (!activityId) throw new Error('ID requerido');

  // Delete mentions first, then the activity
  await db.delete(activityMentions).where(eq(activityMentions.activityId, activityId));
  const act = await db.delete(activities).where(eq(activities.id, activityId)).returning();

  if (act[0]?.mechanicId) {
    redirect(`/panel/admin/user/${act[0].mechanicId}`);
  } else {
    redirect('/panel/admin');
  }
}

// ─── Delete Single Warning ───────────────────────────────────────────
export async function deleteSingleWarning(formData: FormData) {
  await verifyAdmin();
  const warningId = formData.get('warningId') as string;
  if (!warningId) throw new Error('ID requerido');

  await db.delete(warnings).where(eq(warnings.id, warningId));

  redirect('/panel/admin');
}

// ─── Edit Activity ───────────────────────────────────────────────────
export async function editActivity(formData: FormData) {
  await verifyAdmin();
  const activityId = formData.get('activityId') as string;
  const type = formData.get('type') as string;
  const matricula = formData.get('matricula') as string;
  const gruaMatricula = formData.get('gruaMatricula') as string;
  const mechanicId = formData.get('mechanicId') as string;
  const gasolineRaw = formData.get('gasoline') as string;
  const boxesRaw = formData.get('boxes') as string;
  const imageUrl = formData.get('imageUrl') as string;

  const gasoline = gasolineRaw ? parseInt(gasolineRaw, 10) : null;
  const boxes = boxesRaw ? parseInt(boxesRaw, 10) : null;

  if (!activityId) throw new Error('ID requerido');

  await db.update(activities).set({
    type,
    matricula: matricula ? matricula.toUpperCase() : null,
    gruaMatricula: gruaMatricula ? gruaMatricula.toUpperCase() : null,
    gasoline: type === 'maintenance' ? gasoline : null,
    boxes: type === 'maintenance' ? boxes : null,
    imageUrl: imageUrl || null,
  }).where(eq(activities.id, activityId));

  redirect(`/panel/admin/user/${mechanicId}`);
}
