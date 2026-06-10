'use client';

import { useTransition } from 'react';
import { createForumThread } from '@/lib/db/actions-forum';
import { ImageUploader } from '@/components/panel/image-uploader';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function ThreadForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title.trim() || !content.trim()) {
      toast.error('Completá los campos obligatorios');
      return;
    }

    startTransition(async () => {
      try {
        await createForumThread(formData);
        // The action will redirect, no need to do anything here.
      } catch (err: any) {
        toast.error(err.message || 'Ocurrió un error');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border">
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Título del Hilo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Ej: Problema con el motor V8..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Contenido <span className="text-red-500">*</span>
        </label>
        <textarea
          name="content"
          rows={6}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          placeholder="Explicá acá el tema del hilo..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Adjuntar Archivo (Imágenes o Videos mp4) - Opcional
        </label>
        <ImageUploader name="mediaUrl" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link
          href="/foro"
          className="px-6 py-2 rounded font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground font-heading font-bold uppercase px-6 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Creando...' : 'Crear Hilo'}
        </button>
      </div>
    </form>
  );
}
