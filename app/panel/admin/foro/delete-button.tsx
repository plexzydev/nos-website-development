'use client';

import { useTransition } from 'react';
import { adminDeleteThread } from '@/lib/db/actions-forum';
import { toast } from 'sonner';

export function AdminDeleteThreadButton({ threadId }: { threadId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('¿Seguro que querés eliminar este hilo por completo? Esta acción no se puede deshacer.')) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('threadId', threadId);
        await adminDeleteThread(formData);
        toast.success('Hilo eliminado');
      } catch (err: any) {
        toast.error(err.message || 'Error al eliminar');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-block px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors disabled:opacity-50"
    >
      {isPending ? 'Borra...' : 'Borrar'}
    </button>
  );
}
