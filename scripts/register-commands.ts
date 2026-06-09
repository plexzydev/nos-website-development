import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const APP_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const commands = [
  {
    name: 'linkaccount',
    description: 'Linkea tu cuenta de Discord al panel de mecánico.',
    type: 1, // CHAT_INPUT
  }
];

async function register() {
  if (!APP_ID || !GUILD_ID || !BOT_TOKEN) {
    console.error('Faltan variables de entorno para registrar el comando (DISCORD_CLIENT_ID, DISCORD_GUILD_ID, DISCORD_BOT_TOKEN).');
    process.exit(1);
  }

  const url = `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  });

  if (response.ok) {
    console.log('✅ Comando /linkaccount registrado correctamente en tu servidor.');
  } else {
    const error = await response.text();
    console.error('❌ Error registrando el comando:', error);
  }
}

register();
