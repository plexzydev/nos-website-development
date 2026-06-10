import { db } from '@/lib/db';
import { forumThreads, users, forumComments } from '@/lib/db/schema';
import { desc, eq, count } from 'drizzle-orm';
import { ThreadCard } from '@/components/foro/thread-card';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { auth } from '@/auth';

export const metadata = {
  title: 'Foro NOS | Nitrous Oxide System',
  description: 'Comunidad pública de NOS. Votá los mejores aportes.',
};

export default async function ForoPage() {
  const session = await auth();
  const isMechanic = session?.user?.isMechanic;

  // Fetch threads with author info and comments count
  const threads = await db
    .select({
      id: forumThreads.id,
      title: forumThreads.title,
      content: forumThreads.content,
      createdAt: forumThreads.createdAt,
      upvotes: forumThreads.upvotes,
      downvotes: forumThreads.downvotes,
      author: {
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
      },
      commentsCount: count(forumComments.id),
    })
    .from(forumThreads)
    .innerJoin(users, eq(forumThreads.authorId, users.id))
    .leftJoin(forumComments, eq(forumComments.threadId, forumThreads.id))
    .groupBy(forumThreads.id, users.nickname, users.avatarUrl)
    .orderBy(desc(forumThreads.createdAt));

  return (
    <div className="container max-w-4xl pt-32 pb-16 px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-900 uppercase tracking-tighter text-primary">
            Foro Comunitario
          </h1>
          <p className="text-muted-foreground mt-2">
            Mirá los aportes de los mecánicos y votá tus favoritos.
          </p>
        </div>
        
        {isMechanic && (
          <Link
            href="/panel/foro/nuevo"
            className="flex items-center gap-2 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="size-5" />
            Crear Hilo
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {threads.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
            Aún no hay hilos en el foro. {isMechanic && '¡Sé el primero en crear uno!'}
          </div>
        ) : (
          threads.map(thread => (
            <ThreadCard key={thread.id} thread={thread as any} />
          ))
        )}
      </div>
    </div>
  );
}
