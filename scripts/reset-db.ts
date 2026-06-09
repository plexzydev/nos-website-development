import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);

async function reset() {
  console.log('Limpiando toda la data...');
  
  await sql`DELETE FROM "activity_mentions"`;
  await sql`DELETE FROM "activities"`;
  await sql`DELETE FROM "scheduled_activities"`;
  await sql`DELETE FROM "warnings"`;
  await sql`DELETE FROM "notifications"`;
  await sql`UPDATE "users" SET "is_removed" = false, "is_admin" = false`;
  
  console.log('✅ Toda la información fue reiniciada.');
}

reset().catch(e => { console.error(e); process.exit(1); });
