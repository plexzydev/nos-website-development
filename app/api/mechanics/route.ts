import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { ilike, eq, and, ne, isNotNull, or, sql, isNull } from 'drizzle-orm';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';

  const mechanics = await db
    .select({ id: users.id, nickname: users.nickname, userHash: users.userHash })
    .from(users)
    .where(
      and(
        eq(users.isMechanic, true),
        or(eq(users.isRemoved, false), isNull(users.isRemoved)),
        isNotNull(users.nickname),
        or(
          ilike(users.nickname, `%${query}%`),
          ilike(users.userHash, `%${query}%`)
        )
      )
    )
    .limit(10);

  console.log(`[API /api/mechanics] query: "${query}" -> returned ${mechanics.length} mechanics`, mechanics);

  return NextResponse.json(mechanics);
}

