'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { forumThreads, forumComments, forumVotes, users } from '@/lib/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

import { z } from 'zod';

const threadSchema = z.object({
  title: z.string().min(3, "El título es muy corto").max(100, "El título no puede superar los 100 caracteres"),
  content: z.string().min(5, "El contenido es muy corto").max(5000, "El contenido es demasiado largo"),
  mediaUrl: z.string().url("URL de imagen no válida").or(z.literal('')).nullable().optional(),
});

const commentSchema = z.object({
  threadId: z.string().uuid("ID de hilo no válido"),
  content: z.string().min(2, "El comentario es muy corto").max(2000, "El comentario es demasiado largo"),
  mediaUrl: z.string().url("URL de imagen no válida").or(z.literal('')).nullable().optional(),
});

export async function createForumThread(formData: FormData) {
  const session = await auth();
  const discordId = session?.user?.id;
  if (!discordId) throw new Error('No autorizado');

  const userRecord = await db.query.users.findFirst({ where: eq(users.id, discordId) });
  if (!userRecord || (!userRecord.isMechanic && !userRecord.isAdmin)) {
    throw new Error('Sólo mecánicos o administradores pueden crear hilos');
  }

  // Rate Limiting Básico (Evitar Spam)
  const lastThread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.authorId, discordId),
    orderBy: [desc(forumThreads.createdAt)],
  });

  if (lastThread && (Date.now() - lastThread.createdAt.getTime()) < 30000) {
    throw new Error('Estás publicando muy rápido. Esperá 30 segundos.');
  }

  // Validación Zod
  const parsed = threadSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    mediaUrl: formData.get('mediaUrl'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const { title, content, mediaUrl } = parsed.data;

  const newId = randomUUID();

  await db.insert(forumThreads).values({
    id: newId,
    authorId: discordId,
    title,
    content,
    mediaUrl: mediaUrl || null,
  });

  revalidatePath('/', 'layout');
  return { success: true, threadId: newId };
}

export async function createForumComment(formData: FormData) {
  const session = await auth();
  const discordId = session?.user?.id;
  if (!discordId) throw new Error('No autorizado');

  const userRecord = await db.query.users.findFirst({ where: eq(users.id, discordId) });
  if (!userRecord || (!userRecord.isMechanic && !userRecord.isAdmin)) {
    throw new Error('Sólo mecánicos o administradores pueden crear comentarios');
  }

  // Rate Limiting Básico (Evitar Spam)
  const lastComment = await db.query.forumComments.findFirst({
    where: eq(forumComments.authorId, discordId),
    orderBy: [desc(forumComments.createdAt)],
  });

  if (lastComment && (Date.now() - lastComment.createdAt.getTime()) < 15000) {
    throw new Error('Estás comentando muy rápido. Esperá 15 segundos.');
  }

  // Validación Zod
  const parsed = commentSchema.safeParse({
    threadId: formData.get('threadId'),
    content: formData.get('content'),
    mediaUrl: formData.get('mediaUrl'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const { threadId, content, mediaUrl } = parsed.data;

  const newId = randomUUID();

  await db.insert(forumComments).values({
    id: newId,
    threadId,
    authorId: discordId,
    content,
    mediaUrl: mediaUrl || null,
  });

  revalidatePath('/', 'layout');
  return { success: true, commentId: newId };
}

export async function voteForumThread(threadId: string, voteValue: 1 | -1) {
  const cookieStore = await cookies();
  let voterId = cookieStore.get('anon_voter_id')?.value;

  if (!voterId) {
    voterId = randomUUID();
    cookieStore.set('anon_voter_id', voterId, { maxAge: 60 * 60 * 24 * 365, httpOnly: true });
  }

  // Check if they already voted
  const existingVote = await db.query.forumVotes.findFirst({
    where: and(eq(forumVotes.threadId, threadId), eq(forumVotes.voterId, voterId))
  });

  if (existingVote) {
    if (existingVote.vote === voteValue) {
      // Remove vote (toggle off)
      await db.delete(forumVotes).where(eq(forumVotes.id, existingVote.id));
      await db.update(forumThreads).set({
        upvotes: voteValue === 1 ? sql`${forumThreads.upvotes} - 1` : forumThreads.upvotes,
        downvotes: voteValue === -1 ? sql`${forumThreads.downvotes} - 1` : forumThreads.downvotes,
      }).where(eq(forumThreads.id, threadId));
    } else {
      // Switch vote
      await db.update(forumVotes).set({ vote: voteValue }).where(eq(forumVotes.id, existingVote.id));
      await db.update(forumThreads).set({
        upvotes: voteValue === 1 ? sql`${forumThreads.upvotes} + 1` : sql`${forumThreads.upvotes} - 1`,
        downvotes: voteValue === -1 ? sql`${forumThreads.downvotes} + 1` : sql`${forumThreads.downvotes} - 1`,
      }).where(eq(forumThreads.id, threadId));
    }
  } else {
    // New vote
    await db.insert(forumVotes).values({
      id: randomUUID(),
      threadId,
      voterId,
      vote: voteValue,
    });
    await db.update(forumThreads).set({
      upvotes: voteValue === 1 ? sql`${forumThreads.upvotes} + 1` : forumThreads.upvotes,
      downvotes: voteValue === -1 ? sql`${forumThreads.downvotes} + 1` : forumThreads.downvotes,
    }).where(eq(forumThreads.id, threadId));
  }

  revalidatePath('/foro');
  revalidatePath(`/foro/${threadId}`);
}

export async function adminDeleteThread(formData: FormData) {
  const session = await auth();
  const discordId = session?.user?.id;
  if (!discordId) throw new Error('No autorizado');

  const adminRecord = await db.query.users.findFirst({ where: eq(users.id, discordId) });
  if (!adminRecord?.isAdmin) throw new Error('Sólo administradores');

  const threadId = formData.get('threadId') as string;
  await db.delete(forumThreads).where(eq(forumThreads.id, threadId));

  revalidatePath('/panel/admin/foro');
  revalidatePath('/foro');
}

export async function adminDeleteComment(formData: FormData) {
  const session = await auth();
  const discordId = session?.user?.id;
  if (!discordId) throw new Error('No autorizado');

  const adminRecord = await db.query.users.findFirst({ where: eq(users.id, discordId) });
  if (!adminRecord?.isAdmin) throw new Error('Sólo administradores');

  const commentId = formData.get('commentId') as string;
  const threadId = formData.get('threadId') as string;
  
  await db.delete(forumComments).where(eq(forumComments.id, commentId));

  revalidatePath('/panel/admin/foro');
  revalidatePath(`/foro/${threadId}`);
}
