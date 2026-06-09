import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);

async function fix() {
  await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text`;
  
  await sql`CREATE TABLE IF NOT EXISTS "tow_trucks" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamp DEFAULT now()
  )`;

  console.log('done');
}

fix().catch(e => { console.error(e); process.exit(1); });
