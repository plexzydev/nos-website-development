import { db } from '@/lib/db';
import { forumThreads, users, forumComments } from '@/lib/db/schema';
import { desc, eq, count } from 'drizzle-orm';
import { ThreadCard } from '@/components/foro/thread-card';
import Link from 'next/link';
import { CreateThreadModal } from '@/components/foro/create-thread-modal';
import { PageHero } from '@/components/page-hero';
import { auth } from '@/auth';

export const metadata = {
  title: 'Foro NOS | Nitrous Oxide System',
  description: 'Comunidad pública de NOS. Votá los mejores aportes.',
};

export default async function ForoPage() {
  const session = await auth();
  let isMechanic = false;

  if (session?.user?.id) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    isMechanic = !!userRecord?.isMechanic;
  }

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
    <>
      <PageHero
        eyebrow="Comunidad"
        title={
          <>
            Foro <span className="text-primary">NOS</span>
          </>
        }
        description="Mirá los aportes de los mecánicos, participá en las discusiones y votá tus favoritos."
        heroImage={{
          src: '/skyline.png',
          alt: 'Nissan Skyline GTR Amarillo NOS'
        }}
      >
        {isMechanic && <CreateThreadModal />}
      </PageHero>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="space-y-4">
          {threads.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl bg-card">
              Aún no hay hilos en el foro. {isMechanic && '¡Sé el primero en crear uno!'}
            </div>
          ) : (
            threads.map(thread => (
              <ThreadCard key={thread.id} thread={thread as any} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
