import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("Iniciando migraciones...");
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log("Migraciones completadas exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error aplicando migraciones:", err);
  process.exit(1);
});
