'use client';

import { useTransition, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createForumThread } from '@/lib/db/actions-forum';
import { ImageUploader } from '@/components/panel/image-uploader';
import { toast } from 'sonner';
import { Plus, X, MessageSquarePlus } from 'lucide-react';

export function CreateThreadModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
        const result = await createForumThread(formData);
        if (result && result.threadId) {
          setIsOpen(false);
          router.push(`/foro/${result.threadId}`);
        }
      } catch (err: any) {
        toast.error(err.message || 'Ocurrió un error');
      }
    });
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-md transition-opacity" 
        onClick={() => setIsOpen(false)} 
      />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-background border border-border/50 rounded-2xl shadow-[0_0_100px_rgba(255,215,0,0.05)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-border/50 bg-secondary/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquarePlus className="size-6 text-primary" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground uppercase tracking-tight">
              Crear <span className="text-primary">Nuevo Hilo</span>
            </h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-lg"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <div className="relative overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Título del Hilo <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-background transition-all"
                placeholder="Ej: Problema con el motor V8..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contenido <span className="text-primary">*</span>
              </label>
              <textarea
                name="content"
                rows={5}
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-background transition-all resize-none"
                placeholder="Explicá acá el tema del hilo..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Adjuntar Archivo (Imagen o Video)
              </label>
              <div className="bg-secondary/30 p-2 rounded-xl border border-border/50">
                <ImageUploader name="mediaUrl" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-full font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider px-8 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md shadow-primary/20"
              >
                {isPending ? 'Creando...' : 'Publicar Hilo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-heading text-sm font-600 uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 shadow-lg shadow-primary/20"
      >
        <Plus className="size-4" />
        Crear Hilo
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
