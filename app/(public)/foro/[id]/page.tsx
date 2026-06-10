import { db } from '@/lib/db';
import { forumThreads, forumComments, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { VoteButtons } from '@/components/foro/vote-buttons';
import { MediaRenderer } from '@/components/foro/media-renderer';
import { auth } from '@/auth';
import { CommentForm } from '@/components/foro/comment-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ThreadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  let isMechanic = false;

  if (session?.user?.id) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    isMechanic = !!userRecord?.isMechanic;
  }

  const threadRecord = await db
    .select({
      thread: forumThreads,
      author: users,
    })
    .from(forumThreads)
    .innerJoin(users, eq(forumThreads.authorId, users.id))
    .where(eq(forumThreads.id, params.id))
    .limit(1);

  if (!threadRecord.length) {
    notFound();
  }

  const { thread, author } = threadRecord[0];

  const comments = await db
    .select({
      comment: forumComments,
      author: users,
    })
    .from(forumComments)
    .innerJoin(users, eq(forumComments.authorId, users.id))
    .where(eq(forumComments.threadId, thread.id))
    .orderBy(desc(forumComments.createdAt));

  return (
    <>
      <div className="relative overflow-hidden border-b border-border bg-grid pt-32 pb-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/20 -z-10" />
        <div className="mx-auto max-w-4xl relative z-10">
          <Link href="/foro" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium mb-8">
            <ArrowLeft className="size-4" />
            Volver al foro
          </Link>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="hidden md:block">
              <VoteButtons threadId={thread.id} upvotes={thread.upvotes} downvotes={thread.downvotes} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {author.avatarUrl ? (
                  <img src={author.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-border" />
                )}
                <span className="font-medium text-foreground text-base">{author.nickname || 'Anónimo'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(thread.createdAt, { addSuffix: true, locale: es })}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 text-balance">
                {thread.title}
              </h1>

              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg mb-6">
                {thread.content}
              </div>

              <MediaRenderer mediaUrl={thread.mediaUrl} />
              
              <div className="mt-6 md:hidden">
                <VoteButtons threadId={thread.id} upvotes={thread.upvotes} downvotes={thread.downvotes} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-heading font-bold mb-8 flex items-center gap-2">
          Respuestas <span className="text-muted-foreground text-lg">({comments.length})</span>
        </h2>

        {isMechanic ? (
          <div className="mb-12">
            <CommentForm threadId={thread.id} />
          </div>
        ) : (
          <div className="bg-secondary/20 border border-border rounded-xl p-8 mb-12 text-center text-muted-foreground">
            Solo los mecánicos de NOS pueden participar en la discusión.
          </div>
        )}

        <div className="space-y-6">
          {comments.map(({ comment, author: commentAuthor }) => (
            <div key={comment.id} className="p-6 border border-border rounded-xl bg-card">
              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {commentAuthor.avatarUrl ? (
                  <img src={commentAuthor.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20" />
                )}
                <span className="font-medium text-foreground">{commentAuthor.nickname || 'Anónimo'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: es })}</span>
              </div>
              <div className="text-foreground whitespace-pre-wrap text-base">
                {comment.content}
              </div>
              <div className="mt-4">
                <MediaRenderer mediaUrl={comment.mediaUrl} />
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              Nadie ha respondido aún.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
