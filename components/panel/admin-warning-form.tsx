'use client';

import { createWarning } from '@/app/panel/admin/actions';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { useState } from 'react';

type Mechanic = { id: string; nickname: string | null };

export function AdminWarningForm({ mechanics }: { mechanics: Mechanic[] }) {
  const [severity, setSeverity] = useState('amarilla');

  return (
    <form action={createWarning} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="w-mech" className="font-heading text-[10px] font-600 uppercase tracking-widest text-muted-foreground">Mecánico</label>
        <select id="w-mech" name="mechanicId" required
          className="flex h-11 w-full appearance-none rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [color-scheme:dark]">
          <option value="">Seleccionar mecánico...</option>
          {mechanics.map(m => (
            <option key={m.id} value={m.id}>{m.nickname} ({m.id})</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="w-sev" className="font-heading text-[10px] font-600 uppercase tracking-widest text-muted-foreground">Tipo de Medida</label>
        <select 
          id="w-sev" 
          name="severity" 
          required 
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="flex h-11 w-full appearance-none rounded-xl border border-input bg-background/50 px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [color-scheme:dark]"
        >
          <option value="advertencia">Advertencia Simple (Sin Calavera)</option>
          <option value="blanca">Sanción Blanca</option>
          <option value="amarilla">Sanción Amarilla</option>
          <option value="roja">Sanción Roja</option>
          <option value="negra">Sanción Negra</option>
        </select>
      </div>

      {severity !== 'advertencia' && (
        <div className="space-y-1.5 animate-in fade-in">
          <label htmlFor="w-fine" className="font-heading text-[10px] font-600 uppercase tracking-widest text-muted-foreground">Multa a Pagar (opcional)</label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            <input 
              type="text" 
              id="w-fine" 
              name="fineAmount" 
              placeholder="Ej: 50.000"
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="w-reason" className="font-heading text-[10px] font-600 uppercase tracking-widest text-muted-foreground">Razón</label>
        <textarea id="w-reason" name="reason" required rows={2} placeholder="Motivo de la advertencia o sanción..."
          className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
      </div>

      <button type="submit" className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 font-heading text-xs font-600 uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02] active:scale-95">
        <AlertTriangle className="size-4" />
        Aplicar a Mecánico
      </button>
    </form>
  );
}
