import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq, and, or, isNull, isNotNull, ilike } from 'drizzle-orm';

async function test() {
  const query = 'a';
  const mechanics = await db
    .select({ id: users.id, nickname: users.nickname, userHash: users.userHash, isRemoved: users.isRemoved, isMechanic: users.isMechanic })
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
  
  console.log('Result:', mechanics);
}

test().catch(console.error);
