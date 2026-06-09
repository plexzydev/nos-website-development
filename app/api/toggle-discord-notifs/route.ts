import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  const newValue = !user.discordNotifs;
  await db.update(users).set({ discordNotifs: newValue }).where(eq(users.id, session.user.id));

  return NextResponse.json({ discordNotifs: newValue });
}
