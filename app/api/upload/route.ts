import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('Falta la variable de entorno DISCORD_WEBHOOK_URL');
    return NextResponse.json({ error: 'Sistema de subida no configurado' }, { status: 500 });
  }

  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the extension and generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${randomUUID()}.${ext}`;

    // Prepare FormData for Discord Webhook
    const discordFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    discordFormData.append('file', blob, filename);

    // We must append ?wait=true to the webhook URL to get the message data back
    const urlWithWait = new URL(webhookUrl);
    urlWithWait.searchParams.set('wait', 'true');

    const response = await fetch(urlWithWait.toString(), {
      method: 'POST',
      body: discordFormData,
    });

    if (!response.ok) {
      console.error('Error de Discord:', await response.text());
      throw new Error('No se pudo subir a Discord');
    }

    const discordMessage = await response.json();
    
    // Extract the attachment URL from the Discord response
    if (!discordMessage.attachments || discordMessage.attachments.length === 0) {
      throw new Error('Discord no devolvió el archivo adjunto');
    }

    const imageUrl = discordMessage.attachments[0].url;

    // Return the Discord CDN url to the frontend
    return NextResponse.json({ url: imageUrl });
  } catch (e) {
    console.error('Error uploading file:', e);
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}
