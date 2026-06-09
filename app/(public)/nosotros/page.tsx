import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHero } from '@/components/page-hero'
import { RevealGroup } from '@/components/reveal-group'
import { Marquee } from '@/components/marquee'

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'La historia de NOS, un taller mecánico de Del Perro Beach creado por amigos para toda la comunidad de Los Santos.',
}

const VALUES = [
  {
    n: '01',
    title: 'Pasión por el motor',
    desc: 'Cada vehículo que entra al taller lo tratamos como propio. La cultura fierrera es nuestro motor.',
  },
  {
    n: '02',
    title: 'Calidad sin atajos',
    desc: 'Trabajo prolijo, repuestos de confianza y diagnósticos honestos. Sin sorpresas.',
  },
  {
    n: '03',
    title: 'Comunidad primero',
    desc: 'Nacimos entre amigos y crecimos abriendo las puertas a toda la comunidad de Los Santos.',
  },
]

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        eyebrow="Nosotros"
        title={
          <>
            Más que un taller,
            <br />
            <span className="text-primary">una familia</span>
          </>
        }
        description="NOS — Nitrous Oxide System, Inc. — es un taller mecánico ubicado en Del Perro Beach, Los Santos. Una marca creada por amigos con un objetivo claro: ofrecer la mejor mecánica y cultura del motor a toda la comunidad."
      />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <RevealGroup
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border"
            y={0}
          >
            <Image
              data-reveal
              src="/beach-shop.png"
              alt="El local de NOS en Del Perro Beach"
              fill
              className="object-cover"
            />
          </RevealGroup>
          <RevealGroup>
            <h2
              data-reveal
              className="font-heading text-3xl font-700 uppercase leading-tight tracking-tight sm:text-4xl"
            >
              De un grupo de amigos a un referente local
            </h2>
            <p data-reveal className="mt-5 leading-relaxed text-muted-foreground">
              Lo que empezó como reuniones de amigos compartiendo fierros y
              conocimiento, terminó convirtiéndose en un punto de encuentro para
              toda la escena de Los Santos. Hoy NOS es sinónimo de confianza,
              performance y buena onda.
            </p>
            <p data-reveal className="mt-4 leading-relaxed text-muted-foreground">
              Ubicados frente al mar en Del Perro Beach, combinamos un equipo
              técnico de primer nivel con la calidez de un lugar hecho por y
              para apasionados.
            </p>
          </RevealGroup>
        </div>
      </section>

      <Marquee text="PASIÓN · PRECISIÓN · COMUNIDAD · NOS · DEL PERRO BEACH" />

      <section className="mx-auto max-w-5xl px-6 py-24">
        <RevealGroup
          className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3"
          stagger={0.1}
        >
          {VALUES.map((v) => (
            <div key={v.n} data-reveal className="bg-card p-8">
              <span className="font-heading text-5xl font-700 text-primary/30">
                {v.n}
              </span>
              <h3 className="mt-4 font-heading text-xl font-600 uppercase tracking-wide">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {v.desc}
              </p>
            </div>
          ))}
        </RevealGroup>
      </section>
    </>
  )
}
