import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ThreadForm } from './thread-form';

export const metadata = {
  title: 'Crear Hilo | Foro NOS',
};

export default async function NuevoHiloPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.isMechanic) {
    redirect('/foro');
  }

  return (
    <div className="container max-w-2xl py-12 px-6">
      <h1 className="text-3xl font-heading font-bold text-foreground mb-8">
        Crear Nuevo Hilo
      </h1>
      
      <ThreadForm />
    </div>
  );
}
