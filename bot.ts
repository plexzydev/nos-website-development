import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, scheduledActivities, notifications } from './lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env' });

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const databaseUrl = process.env.DATABASE_URL;

if (!token || !clientId || !guildId || !databaseUrl) {
  console.error("Faltan variables en el archivo .env (DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, DATABASE_URL)");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  {
    name: 'linkaccount',
    description: 'Linkea tu cuenta de Discord al panel de mecánico.',
    options: [
      {
        name: 'hash',
        type: 3, // STRING
        description: 'Tu identificador de 4 letras (ej: #ABCD)',
        required: true,
      }
    ]
  },
];

const rest = new REST({ version: '10' }).setToken(token);

// ─── Scheduled Activity Checker (runs every 30 seconds) ──────────────
async function checkScheduledActivities() {
  try {
    const activeSchedules = await db.select().from(scheduledActivities).where(eq(scheduledActivities.isActive, true));

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    for (const schedule of activeSchedules) {
      // Exact minute match AND not already notified today
      if (currentTime === schedule.dailyTime && schedule.lastNotifiedDate !== today) {
        console.log(`🔔 Disparando actividad: "${schedule.title}" (${schedule.dailyTime}hs)`);

        // Mark as notified
        await db.update(scheduledActivities)
          .set({ lastNotifiedDate: today })
          .where(eq(scheduledActivities.id, schedule.id));

        // Fetch all mechanics
        const mechanics = await db
          .select({ id: users.id, discordNotifs: users.discordNotifs })
          .from(users)
          .where(eq(users.isMechanic, true));

        if (mechanics.length === 0) continue;

        // Insert web notifications for ALL mechanics
        await db.insert(notifications).values(
          mechanics.map(m => ({
            id: randomUUID(),
            userId: m.id,
            message: `🔔 ¡Actividad en curso! "${schedule.title}" — ${schedule.dailyTime}hs`,
          }))
        );
        console.log(`  ✅ ${mechanics.length} notificaciones web creadas`);

        // Send Discord DMs only to those who have it enabled
        for (const mechanic of mechanics) {
          if (!mechanic.discordNotifs) {
            console.log(`  ⏭️ ${mechanic.id} tiene DMs desactivados, skip`);
            continue;
          }
          try {
            const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
              method: 'POST',
              headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipient_id: mechanic.id }),
            });
            if (dmRes.ok) {
              const dmChannel = await dmRes.json();
              await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  embeds: [{
                    title: '🔔 Actividad en Curso — NOS',
                    description: `**${schedule.title}**${schedule.description ? `\n${schedule.description}` : ''}`,
                    color: 0xF5A623,
                    fields: [{ name: '⏰ Horario', value: `${schedule.dailyTime}hs (todos los días)`, inline: true }],
                    footer: { text: 'NOS · Panel de Mecánico' },
                  }],
                }),
              });
              console.log(`  📩 DM enviado a ${mechanic.id}`);
            }
          } catch (e) {
            console.error(`  ❌ Error DM a ${mechanic.id}:`, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('❌ Error en checkScheduledActivities:', e);
  }
}

// ─── Bot Events ──────────────────────────────────────────────────────
client.on('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user?.tag}!`);
  console.log(`📡 Registrando comando en el servidor ${guildId}...`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('✅ Comando /linkaccount registrado exitosamente.');
  } catch (error) {
    console.error('❌ Error al registrar el comando:', error);
  }

  // Start the scheduler — check every 30 seconds
  console.log('⏰ Scheduler de actividades iniciado (cada 30s)');
  setInterval(checkScheduledActivities, 30_000);
  // Run immediately on startup
  checkScheduledActivities();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'linkaccount') {
    const discordId = interaction.user.id;
    // @ts-ignore
    const nickname = interaction.member?.nickname || interaction.user.globalName || interaction.user.username;
    const hashArg = interaction.options.getString('hash')?.toUpperCase();

    if (!hashArg || !/^#[A-Z]{4}$/.test(hashArg)) {
      return interaction.reply({ content: '❌ El hash debe tener exactamente el formato #XXXX (un numeral seguido de 4 letras, sin números ni símbolos). Ej: `#ABCD`', ephemeral: true });
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      // Comprobar si el hash ya está en uso por OTRO usuario
      const existingUser = await db.select().from(users).where(and(eq(users.userHash, hashArg), ne(users.id, discordId)));
      if (existingUser.length > 0) {
        return interaction.editReply(`❌ El hash **${hashArg}** ya está siendo utilizado por otro mecánico. Elegí uno diferente.`);
      }

      await db.insert(users).values({
        id: discordId,
        nickname: nickname,
        userHash: hashArg,
        isMechanic: false
      }).onConflictDoUpdate({
        target: users.id,
        set: { nickname: nickname, userHash: hashArg }
      });

      await interaction.editReply(`✅ ¡Cuenta linkeada exitosamente! Hola, **${nickname}** (**${hashArg}**). Tu ID (${discordId}) ha sido guardado. Ahora puedes ingresar al panel en la web.`);
    } catch (error) {
      console.error("Error guardando en la DB:", error);
      await interaction.editReply('Hubo un error al guardar tu cuenta en la base de datos.');
    }
  }
});

client.login(token);
