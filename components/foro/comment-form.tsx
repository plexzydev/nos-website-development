'use client';

import { useTransition, useRef } from 'react';
import { createForumComment } from '@/lib/db/actions-forum';
import { ImageUploader } from '@/components/panel/image-uploader';
import { toast } from 'sonner';

export function CommentForm({ threadId }: { threadId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get('content') as string;

    if (!content.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    startTransition(async () => {
      try {
        await createForumComment(formData);
        toast.success('Comentario publicado');
        formRef.current?.reset();
      } catch (err: any) {
        toast.error(err.message || 'Ocurrió un error');
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="p-5 border border-border rounded-xl bg-card">
      <input type="hidden" name="threadId" value={threadId} />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Escribir respuesta
        </label>
        <textarea
          name="content"
          rows={3}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          placeholder="¿Qué querés aportar a este hilo?"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Adjuntar Archivo (Imagen o Video mp4) - Opcional
        </label>
        <ImageUploader name="mediaUrl" />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground font-heading font-bold uppercase px-6 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Enviando...' : 'Comentar'}
        </button>
      </div>
    </form>
  );
}
