import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);

async function fix() {
  await sql`ALTER TABLE "warnings" ADD COLUMN IF NOT EXISTS "severity" text DEFAULT 'amarilla'`;
  
  await sql`CREATE TABLE IF NOT EXISTS "settings" (
    "key" text PRIMARY KEY NOT NULL,
    "value" text
  )`;

  console.log('done');
}

fix().catch(e => { console.error(e); process.exit(1); });
