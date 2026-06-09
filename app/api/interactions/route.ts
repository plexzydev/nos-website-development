import { NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const body = await req.text();

  if (!signature || !timestamp || !process.env.DISCORD_PUBLIC_KEY) {
    return NextResponse.json({ error: 'Faltan cabeceras o PUBLIC_KEY' }, { status: 401 });
  }

  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY
  );

  if (!isValidRequest) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Ping interaction from Discord
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Slash Command interaction
  if (interaction.type === 2) {
    if (interaction.data.name === 'linkaccount') {
      const user = interaction.member?.user || interaction.user;
      if (!user) {
        return NextResponse.json({
          type: 4,
          data: { content: 'No se pudo obtener la información de tu usuario.' }
        });
      }

      const discordId = user.id;
      const nickname = interaction.member?.nick || user.global_name || user.username;

      try {
        // Guardamos o actualizamos en la DB
        await db.insert(users).values({
          id: discordId,
          nickname: nickname,
          isMechanic: false // Se validará mediante el rol en tiempo real luego
        }).onConflictDoUpdate({
          target: users.id,
          set: { nickname: nickname }
        });

        return NextResponse.json({
          type: 4,
          data: {
            content: `¡Cuenta linkeada exitosamente! Hola, **${nickname}**. Tu ID (${discordId}) ha sido guardado. Ahora puedes ingresar al panel en la web.`,
            flags: 64 // Ephemeral (solo lo ve el usuario)
          }
        });
      } catch (error) {
        console.error("Error guardando en DB:", error);
        return NextResponse.json({
          type: 4,
          data: {
            content: 'Hubo un error al guardar tu información en la base de datos.',
            flags: 64
          }
        });
      }
    }
  }

  return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}
