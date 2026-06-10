'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { forumThreads, forumComments, forumVotes, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

export async function createForumThread(formData: FormData) {
  const session = await auth();
  const discordId = session?.user?.id;
  if (!discordId) throw new Error('No autorizado');

  const userRecord = await db.query.users.findFirst({ where: eq(users.id, discordId) });
  if (!userRecord || !userRecord.isMechanic) throw new Error('Sólo mecánicos pueden crear hilos');

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const mediaUrl = formData.get('mediaUrl') as string;

  if (!title || !content) {
    throw new Error('Faltan campos obligatorios');
  }

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
  if (!userRecord || !userRecord.isMechanic) throw new Error('Sólo mecánicos pueden comentar');

  const threadId = formData.get('threadId') as string;
  const content = formData.get('content') as string;
  const mediaUrl = formData.get('mediaUrl') as string;

  if (!threadId || !content) {
    throw new Error('Faltan campos obligatorios');
  }

  await db.insert(forumComments).values({
    id: randomUUID(),
    threadId,
    authorId: discordId,
    content,
    mediaUrl: mediaUrl || null,
  });

  revalidatePath(`/foro/${threadId}`);
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
