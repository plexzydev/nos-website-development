'use client';

import { useFormStatus } from 'react-dom';
import { Wrench, Loader2 } from 'lucide-react';

export function SubmitButton({ label = 'Guardar' }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-heading text-sm font-600 uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Wrench className="size-4" />}
      {pending ? 'Guardando...' : label}
    </button>
  );
}
