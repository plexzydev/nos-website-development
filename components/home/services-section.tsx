import {
  Gauge,
  Wrench,
  Paintbrush,
  Cog,
  ShieldCheck,
  Flame,
} from 'lucide-react'
import { RevealGroup } from '@/components/reveal-group'

const SERVICES = [
  {
    icon: Gauge,
    title: 'Performance & Tuning',
    desc: 'Optimización de motor, mapeo y ajustes para sacar el máximo de cada vehículo.',
  },
  {
    icon: Flame,
    title: 'Sistemas NOS',
    desc: 'Instalación y mantenimiento de sistemas de óxido nitroso con seguridad garantizada.',
  },
  {
    icon: Wrench,
    title: 'Reparación general',
    desc: 'Mecánica integral, diagnóstico y soluciones rápidas para cualquier falla.',
  },
  {
    icon: Paintbrush,
    title: 'Estética & Wraps',
    desc: 'Pintura, vinilos y detallado para que tu auto se vea tan rápido como anda.',
  },
  {
    icon: Cog,
    title: 'Suspensión & Frenos',
    desc: 'Puesta a punto del chasis, suspensión y sistemas de frenado de alto rendimiento.',
  },
  {
    icon: ShieldCheck,
    title: 'Mantenimiento',
    desc: 'Planes preventivos para mantener tu vehículo siempre listo para la calle.',
  },
]

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <RevealGroup className="mb-14 max-w-2xl">
        <p
          data-reveal
          className="font-heading text-sm font-600 uppercase tracking-[0.3em] text-primary"
        >
          Lo que hacemos
        </p>
        <h2
          data-reveal
          className="mt-4 font-heading text-4xl font-700 uppercase leading-tight tracking-tight text-balance sm:text-5xl"
        >
          Servicios de taller, nivel competición
        </h2>
      </RevealGroup>

      <RevealGroup
        className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.08}
      >
        {SERVICES.map((s) => (
          <div
            key={s.title}
            data-reveal
            className="group relative bg-card p-7 transition-colors hover:bg-secondary"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
              <s.icon className="size-6" />
            </div>
            <h3 className="mt-5 font-heading text-xl font-600 uppercase tracking-wide">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {s.desc}
            </p>
          </div>
        ))}
      </RevealGroup>
    </section>
  )
}
