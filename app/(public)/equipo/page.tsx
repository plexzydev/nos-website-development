import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { RevealGroup } from '@/components/reveal-group'
import { Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Equipo',
  description:
    'Conocé al equipo de mecánicos de NOS, el taller de Del Perro Beach en Los Santos.',
}

const TEAM = [
  { name: 'Dueño', role: 'Fundador & Jefe de Taller', initials: 'NO' },
  { name: 'Co-Fundador', role: 'Subjefe & Performance', initials: 'NS' },
  { name: 'Mecánico Senior', role: 'Especialista en motores', initials: 'MS' },
  { name: 'Mecánico', role: 'Suspensión & Frenos', initials: 'MC' },
  { name: 'Mecánico', role: 'Estética & Wraps', initials: 'MC' },
  { name: 'Aprendiz', role: 'Mantenimiento general', initials: 'AP' },
]

export default function EquipoPage() {
  return (
    <>
      <PageHero
        eyebrow="Equipo"
        title={
          <>
            Las manos detrás
            <br />
            <span className="text-primary">de cada motor</span>
          </>
        }
        description="Un equipo de mecánicos apasionados que comparten un mismo objetivo: que tu vehículo salga del taller mejor de lo que entró. Estos son los miembros de la familia NOS."
        heroImage={{
          src: '/skyline.png',
          alt: 'Nissan Skyline GTR Amarillo NOS'
        }}
      />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <RevealGroup
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.08}
        >
          {TEAM.map((m, i) => (
            <article
              key={i}
              data-reveal
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/[0.06] transition-transform duration-500 group-hover:scale-150"
              />
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary font-heading text-xl font-700 text-primary-foreground">
                {m.initials}
              </div>
              <h3 className="relative mt-5 font-heading text-xl font-600 uppercase tracking-wide">
                {m.name}
              </h3>
              <p className="relative mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="size-3.5 text-primary" />
                {m.role}
              </p>
            </article>
          ))}
        </RevealGroup>

        <RevealGroup className="mt-12">
          <p
            data-reveal
            className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground"
          >
            ¿Sos parte del equipo? Ingresá al{' '}
            <span className="font-600 text-primary">panel de mecánico</span>{' '}
            para gestionar tu perfil.
          </p>
        </RevealGroup>
      </section>
    </>
  )
}
