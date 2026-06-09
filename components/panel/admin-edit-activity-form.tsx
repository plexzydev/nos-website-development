'use client';

import { editActivity } from '@/app/panel/admin/actions';
import { Save, Wrench, Hash, Truck } from 'lucide-react';
import { useState } from 'react';
import { ImageUploader } from '@/components/panel/image-uploader';

type TowTruck = {
  id: string;
  name: string;
};

export function AdminEditActivityForm({ 
  activityId, 
  mechanicId, 
  defaultType, 
  defaultMatricula, 
  defaultGrua, 
  defaultGasoline,
  defaultBoxes,
  defaultImageUrl,
  towTrucks 
}: { 
  activityId: string;
  mechanicId: string;
  defaultType: string;
  defaultMatricula: string;
  defaultGrua: string;
  defaultGasoline: number | null;
  defaultBoxes: number | null;
  defaultImageUrl: string;
  towTrucks: TowTruck[];
}) {
  const [type, setType] = useState(defaultType);

  return (
    <form action={editActivity} className="space-y-6">
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="mechanicId" value={mechanicId} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Tipo de Actividad</label>
          <div className="relative">
            <Wrench className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            <select 
              name="type" 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [color-scheme:dark]"
            >
              <option value="repair">🔧 Reparación</option>
              <option value="tuning">⚡ Tuning / Modificación</option>
              <option value="maintenance">🛠️ Actividades (Mantenimiento)</option>
              <option value="tow">🚛 Grúa</option>
              <option value="other">📋 Otro</option>
            </select>
          </div>
        </div>

        {type !== 'maintenance' && type !== 'tow' && (
          <div className="space-y-2 animate-in fade-in">
            <label className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Matrícula del Vehículo</label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
              <input 
                type="text" 
                name="matricula" 
                defaultValue={defaultMatricula} 
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" 
              />
            </div>
          </div>
        )}

        {(type === 'maintenance' || type === 'tow') && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Grúa Utilizada {type === 'maintenance' ? '(opcional)' : ''}</label>
            <div className="relative">
              <Truck className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
              <select 
                name="gruaMatricula" 
                defaultValue={defaultGrua} 
                className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [color-scheme:dark]"
              >
                <option value="">Ninguna</option>
                {towTrucks.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {type === 'maintenance' && (
          <>
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label htmlFor="gasoline" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Gasolina (0 a 60)</label>
              <div className="relative">
                <input
                  type="number"
                  id="gasoline"
                  name="gasoline"
                  min="0"
                  max="60"
                  step="1"
                  defaultValue={defaultGasoline ?? ''}
                  className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label htmlFor="boxes" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Cajas (3 a 6)</label>
              <div className="relative">
                <select
                  id="boxes"
                  name="boxes"
                  defaultValue={defaultBoxes?.toString() || ''}
                  className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background/50 px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [color-scheme:dark]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">
          Imágenes
        </label>
        <ImageUploader name="imageUrl" defaultValues={defaultImageUrl || ''} />
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-heading text-xs font-600 uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95">
          <Save className="size-4" />
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
