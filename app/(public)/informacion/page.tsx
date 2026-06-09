import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { RevealGroup } from '@/components/reveal-group'
import { Marquee } from '@/components/marquee'
import { MapPin, Phone, Users, Clock, Hash } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Más información',
  description:
    'Ubicación, contacto, horarios y servicios del taller NOS en Del Perro Beach, Los Santos.',
}

const INFO = [
  { icon: MapPin, label: 'Ubicación', value: 'Del Perro Beach, Los Santos' },
  { icon: Phone, label: 'Teléfono', value: '386068' },
  { icon: Hash, label: 'HASH', value: '#USA1N5' },
  { icon: Users, label: 'Miembros', value: '25 integrantes' },
]

const FAQ = [
  {
    q: '¿Necesito turno para llevar mi vehículo?',
    a: 'Recomendamos coordinar previamente por nuestros canales para asegurarte atención inmediata, aunque también atendemos por orden de llegada según disponibilidad.',
  },
  {
    q: '¿Trabajan con todo tipo de vehículos?',
    a: 'Sí. Desde mantenimiento de uso diario hasta builds de competición y sistemas de óxido nitroso, nuestro equipo cubre todo el espectro.',
  },
  {
    q: '¿Cómo me uno a la comunidad NOS?',
    a: 'Sumate a nuestro Discord discord.gg/nostuners. Ahí compartimos novedades, eventos y coordinamos los trabajos del taller.',
  },
  {
    q: '¿Cómo accede el personal al sistema interno?',
    a: 'Los mecánicos inician sesión con Discord y vinculan su cuenta mediante el comando /linkaccount para acceder a su panel y perfil.',
  },
]

export default function InformacionPage() {
  return (
    <>
      <PageHero
        eyebrow="Más información"
        title={
          <>
            Todo lo que
            <br />
            <span className="text-primary">necesitás saber</span>
          </>
        }
        description="Ubicación, contacto, horarios y respuestas a las preguntas más frecuentes sobre el taller NOS."
      />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <RevealGroup
          className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
        >
          {INFO.map((i) => (
            <div key={i.label} data-reveal className="bg-card p-7">
              <i.icon className="size-6 text-primary" />
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                {i.label}
              </p>
              <p className="mt-1 font-heading text-lg font-600">{i.value}</p>
            </div>
          ))}
        </RevealGroup>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        <RevealGroup className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div
            data-reveal
            className="rounded-2xl border border-border bg-card p-8"
          >
            <div className="flex items-center gap-2 text-primary">
              <Clock className="size-5" />
              <h2 className="font-heading text-xl font-600 uppercase tracking-wide">
                Horarios de atención
              </h2>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                ['Lunes a Viernes', '09:00 — 22:00'],
                ['Sábados', '10:00 — 23:00'],
                ['Domingos', 'Según eventos'],
              ].map(([d, h]) => (
                <li
                  key={d}
                  className="flex items-center justify-between border-b border-border pb-3 text-muted-foreground last:border-0"
                >
                  <span>{d}</span>
                  <span className="font-600 text-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-reveal
            className="flex flex-col justify-center rounded-2xl border border-border bg-primary p-8 text-primary-foreground"
          >
            <h2 className="font-heading text-2xl font-700 uppercase leading-tight tracking-tight">
              Encontranos en Del Perro Beach
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
              Frente al mar, en el corazón de la costa de Los Santos. Imposible
              no vernos: buscá el cartel amarillo de NOS.
            </p>
          </div>
        </RevealGroup>
      </section>

      <Marquee text="REPARACIÓN · TUNING · PERFORMANCE · NOS · ATENCIÓN AL CLIENTE" />

      <section className="mx-auto max-w-3xl px-6 py-24">
        <RevealGroup className="mb-10">
          <h2
            data-reveal
            className="font-heading text-3xl font-700 uppercase tracking-tight sm:text-4xl"
          >
            Preguntas frecuentes
          </h2>
        </RevealGroup>
        <RevealGroup className="space-y-4" stagger={0.08}>
          {FAQ.map((f) => (
            <details
              key={f.q}
              data-reveal
              className="group rounded-2xl border border-border bg-card p-6 [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between font-heading text-lg font-600 uppercase tracking-wide marker:content-['']">
                {f.q}
                <span className="ml-4 text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </RevealGroup>
      </section>
    </>
  )
}
