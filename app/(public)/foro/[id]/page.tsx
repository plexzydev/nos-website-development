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

export default async function ThreadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const isMechanic = session?.user?.isMechanic;

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
    <div className="container max-w-4xl pt-32 pb-16 px-6">
      <Link href="/foro" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium mb-6 inline-block">
        &larr; Volver al foro
      </Link>

      <div className="flex gap-4 p-6 border border-border rounded-xl bg-card">
        <VoteButtons threadId={thread.id} upvotes={thread.upvotes} downvotes={thread.downvotes} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20" />
            )}
            <span className="font-medium text-foreground">{author.nickname || 'Anónimo'}</span>
            <span>•</span>
            <span>{formatDistanceToNow(thread.createdAt, { addSuffix: true, locale: es })}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
            {thread.title}
          </h1>

          <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {thread.content}
          </div>

          <MediaRenderer mediaUrl={thread.mediaUrl} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-heading font-bold mb-6">Comentarios ({comments.length})</h2>

        {isMechanic ? (
          <div className="mb-8">
            <CommentForm threadId={thread.id} />
          </div>
        ) : (
          <div className="bg-secondary/20 border border-border rounded-xl p-6 mb-8 text-center text-muted-foreground">
            Solo los mecánicos de NOS pueden dejar comentarios.
          </div>
        )}

        <div className="space-y-4">
          {comments.map(({ comment, author: commentAuthor }) => (
            <div key={comment.id} className="p-5 border border-border rounded-xl bg-card">
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {commentAuthor.avatarUrl ? (
                  <img src={commentAuthor.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20" />
                )}
                <span className="font-medium text-foreground">{commentAuthor.nickname || 'Anónimo'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: es })}</span>
              </div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {comment.content}
              </div>
              <MediaRenderer mediaUrl={comment.mediaUrl} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
