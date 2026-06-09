import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import { users } from '../lib/db/schema';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function check() {
  const allUsers = await db.select().from(users);
  console.log('Usuarios en la DB:', allUsers);
}

check();
