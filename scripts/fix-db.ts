import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);

async function fix() {
  await sql`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "matricula" text`;
  await sql`ALTER TABLE "activities" DROP COLUMN IF EXISTS "title"`;
  await sql`ALTER TABLE "activities" DROP COLUMN IF EXISTS "description"`;
  await sql`ALTER TABLE "activities" DROP COLUMN IF EXISTS "price"`;
  console.log('done');
}

fix().catch(e => { console.error(e); process.exit(1); });
