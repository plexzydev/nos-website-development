'use client';

import { useTransition, useState } from 'react';
import { createForumThread } from '@/lib/db/actions-forum';
import { ImageUploader } from '@/components/panel/image-uploader';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

export function CreateThreadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        setIsOpen(false);
        // The action redirects, but if it doesn't we just close the modal.
      } catch (err: any) {
        toast.error(err.message || 'Ocurrió un error');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-heading text-sm font-600 uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Plus className="size-4" />
        Crear Hilo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-heading font-bold text-foreground">Crear Nuevo Hilo</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 rounded font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary text-primary-foreground font-heading font-bold uppercase px-6 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Creando...' : 'Crear Hilo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
