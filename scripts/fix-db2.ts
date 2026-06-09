import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);

async function fix() {
  await sql`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "scheduled_activity_id" text`;
  await sql`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "grua_matricula" text`;
  console.log('done');
}

fix().catch(e => { console.error(e); process.exit(1); });
