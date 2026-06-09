'use client';

import { createActivity } from '@/app/panel/new/actions';
import { Wrench, Gauge, Activity, ArrowLeft, Hash, Calendar, Truck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MentionsInput } from '@/components/panel/mentions-input';
import { ImageUploader } from '@/components/panel/image-uploader';
import { SubmitButton } from '@/components/panel/submit-button';

type ScheduledActivity = {
  id: string;
  title: string;
};

type TowTruck = {
  id: string;
  name: string;
};

export function NewActivityForm({ scheduledActivities, towTrucks }: { scheduledActivities: ScheduledActivity[], towTrucks: TowTruck[] }) {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('type') || 'repair';
  const [type, setType] = useState(defaultType);

  return (
    <div className="pt-4">
      <Link href="/panel" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver al Dashboard
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative">
          <h2 className="font-heading text-2xl font-700 uppercase tracking-tight">Registrar Actividad</h2>
          <p className="mt-1 text-sm text-muted-foreground">Completá los datos del trabajo realizado</p>

          <form action={createActivity} className="mt-8 space-y-6">
            {/* Type & Matricula */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="type" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Tipo de Trabajo</label>
                <div className="relative">
                  <Wrench className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                  <select
                    id="type"
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <option value="repair">🔧 Reparación</option>
                    <option value="tuning">⚡ Tuning / Modificación</option>
                    <option value="maintenance">🛠️ Actividades</option>
                    <option value="tow">🚛 Grúa</option>
                    <option value="other">📋 Otro</option>
                  </select>
                </div>
              </div>
              {type !== 'maintenance' && type !== 'tow' && (
                <div className="space-y-2 animate-in fade-in">
                  <label htmlFor="matricula" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Matrícula del Vehículo</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      id="matricula"
                      name="matricula"
                      placeholder="Ej: ABC 123"
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium uppercase ring-offset-background transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
              )}
              {type === 'tow' && (
                <div className="space-y-2 animate-in fade-in">
                  <label htmlFor="gruaMatricula" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Grúa Utilizada</label>
                  <div className="relative">
                    <Truck className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                    <select
                      id="gruaMatricula"
                      name="gruaMatricula"
                      className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium uppercase ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <option value="">Seleccionar grúa...</option>
                      {towTrucks.map(truck => (
                        <option key={truck.id} value={truck.name}>{truck.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Conditional Fields for "Actividades" (maintenance) */}
            {type === 'maintenance' && (
              <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label htmlFor="scheduledActivityId" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Actividad Programada</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                    <select
                      id="scheduledActivityId"
                      name="scheduledActivityId"
                      className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <option value="">Ninguna (Libre)</option>
                      {scheduledActivities.map(sa => (
                        <option key={sa.id} value={sa.id}>{sa.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="gruaMatricula" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Grúa Utilizada (Opcional)</label>
                  <div className="relative">
                    <Truck className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                    <select
                      id="gruaMatricula"
                      name="gruaMatricula"
                      className="flex h-12 w-full appearance-none rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm font-medium uppercase ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <option value="">Ninguna</option>
                      {towTrucks.map(truck => (
                        <option key={truck.id} value={truck.name}>{truck.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="gasoline" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Gasolina (0 a 60)</label>
                  <div className="relative">
                    <input
                      type="number"
                      id="gasoline"
                      name="gasoline"
                      min="0"
                      max="60"
                      step="1"
                      placeholder="Ej: 30"
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="boxes" className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Cajas (3 a 6)</label>
                  <div className="relative">
                    <select
                      id="boxes"
                      name="boxes"
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
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">
                Imagen del Vehículo {type === 'tow' && <span className="text-primary">*</span>}
              </label>
              <ImageUploader name="imageUrl" />
              {type === 'tow' && (
                <p className="text-[10px] text-muted-foreground">La imagen es obligatoria para los servicios de grúa.</p>
              )}
            </div>

            {/* Mentions with Autocomplete */}
            <div className="space-y-2">
              <label className="font-heading text-xs font-600 uppercase tracking-widest text-muted-foreground">Arrobar Mecánicos</label>
              <MentionsInput name="mentions" />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <Link
                href="/panel"
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-border bg-secondary px-8 font-heading text-sm font-600 uppercase tracking-wider transition-colors hover:bg-secondary/80"
              >
                Cancelar
              </Link>
              <SubmitButton label="Guardar" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
