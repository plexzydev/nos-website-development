import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function test() {
  const guildId = process.env.DISCORD_GUILD_ID;
  const token = process.env.DISCORD_BOT_TOKEN;
  // User ID: 321857866504634368 is just an example, maybe use the DB users.
  import { db } from './lib/db';
  import { users } from './lib/db/schema';
  const allUsers = await db.select().from(users);
  
  for (const u of allUsers) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${u.id}`, {
      headers: { Authorization: `Bot ${token}` }
    });
    if (res.ok) {
      const member = await res.json();
      console.log(`DB Nickname: ${u.nickname} | Server Nick: ${member.nick} | Global Name: ${member.user.global_name} | Username: ${member.user.username}`);
    }
  }
}
test();
