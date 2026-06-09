import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { RevealGroup } from '@/components/reveal-group'

export function CtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <RevealGroup className="relative overflow-hidden rounded-3xl border border-border bg-primary px-8 py-16 text-primary-foreground sm:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-1/2 hidden h-[160%] w-1/3 -translate-y-1/2 -skew-x-12 bg-primary-foreground/10 md:block"
        />
        <div data-reveal className="relative max-w-2xl">
          <h2 className="font-heading text-4xl font-700 uppercase leading-tight tracking-tight text-balance sm:text-5xl">
            ¿Listo para llevar tu vehículo al límite?
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/80">
            Sumate a la comunidad NOS. Encontrá toda la información de contacto,
            ubicación y servicios disponibles.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/informacion"
              className="group inline-flex items-center gap-2 rounded-full bg-primary-foreground px-7 py-3.5 font-heading text-sm font-600 uppercase tracking-wider text-primary transition-transform hover:scale-[1.03] active:scale-95"
            >
              Más información
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/panel"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-7 py-3.5 font-heading text-sm font-600 uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Soy mecánico
            </Link>
          </div>
        </div>
      </RevealGroup>
    </section>
  )
}
