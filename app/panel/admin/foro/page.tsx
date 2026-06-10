import { auth } from '@/auth';
import { db } from '@/lib/db';
import { forumThreads, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { AdminDeleteThreadButton } from './delete-button';
import Link from 'next/link';

export const metadata = {
  title: 'Moderación del Foro | Admin NOS',
};

export default async function AdminForoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!currentUser?.isAdmin) {
    redirect('/panel');
  }

  const threads = await db
    .select({
      id: forumThreads.id,
      title: forumThreads.title,
      content: forumThreads.content,
      createdAt: forumThreads.createdAt,
      author: {
        nickname: users.nickname,
      },
    })
    .from(forumThreads)
    .innerJoin(users, eq(forumThreads.authorId, users.id))
    .orderBy(desc(forumThreads.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Moderación del Foro
          </h1>
          <p className="text-muted-foreground mt-1">
            Administrá y moderá los hilos creados por los mecánicos.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4">Hilo</th>
                <th className="px-6 py-4">Autor</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {threads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No hay hilos en el foro.
                  </td>
                </tr>
              ) : (
                threads.map((thread) => (
                  <tr key={thread.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground max-w-sm truncate">
                        {thread.title}
                      </div>
                      <div className="text-muted-foreground truncate max-w-sm">
                        {thread.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {thread.author.nickname || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {thread.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        href={`/foro/${thread.id}`}
                        target="_blank"
                        className="inline-block px-3 py-1.5 bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors"
                      >
                        Ver
                      </Link>
                      <AdminDeleteThreadButton threadId={thread.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
