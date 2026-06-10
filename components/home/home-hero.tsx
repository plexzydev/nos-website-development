'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowRight, Wrench } from 'lucide-react'
import { registerGsap, gsap } from '@/lib/gsap'

export function HomeHero() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    registerGsap()
    const el = root.current
    if (!el) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      gsap.set(el, { autoAlpha: 1 })
      tl.from('[data-h-line]', {
        yPercent: 110,
        duration: 1,
        stagger: 0.12,
      })
        .from('[data-h-sub]', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('[data-h-cta]', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
        .from('[data-h-stat]', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.3')
        .from('[data-hero-car]', { x: -300, opacity: 0, duration: 1.5, ease: 'power3.out' }, '-=1')

    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={root}
      className="js-reveal relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-grid opacity-60" />
      </div>

      {/* Diagonal Cut Effect + Car Image */}
      <div className="pointer-events-none absolute right-[-10%] top-1/2 hidden h-[140%] w-[40%] -translate-y-1/2 -skew-x-12 bg-primary/[0.04] md:block z-0 xl:right-[-5%] xl:w-[35%]">
        <div data-hero-car className="absolute left-[-125%] top-[45%] w-[170%] -translate-y-1/2 skew-x-12 select-none xl:left-[-55%] xl:w-[135%]">
          <Image
            src="/skyline.png"
            alt="Nissan Skyline GTR Amarillo NOS"
            width={1200}
            height={600}
            className="h-auto w-full object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-28">
        <p
          data-h-sub
          className="flex items-center gap-2 font-heading text-sm font-600 uppercase tracking-[0.3em] text-primary"
        >
          <Wrench className="size-4" />
          Nitrous Oxide System · Los Santos
        </p>

        <h1 className="mt-5 font-heading text-6xl font-700 uppercase leading-[0.88] tracking-tight sm:text-8xl">
          <span className="block overflow-hidden">
            <span data-h-line className="block">
              Potencia
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-h-line className="block text-primary">
              sin límites
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-h-line className="block">
              en Del Perro
            </span>
          </span>
        </h1>

        <p
          data-h-sub
          className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          Taller mecánico creado por amigos para toda la comunidad de Los
          Santos. Reparación, performance y tuning con el sello NOS.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <div data-h-cta>
            <Link
              href="/informacion"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-heading text-sm font-600 uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
            >
              Conocé nuestros servicios
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div data-h-cta>
            <a
              href="https://discord.gg/nostuners"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 font-heading text-sm font-600 uppercase tracking-wider text-foreground transition-all hover:bg-secondary hover:scale-[1.03] active:scale-95"
            >
              Conocé al equipo
            </a>
          </div>
        </div>

        <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
          {[
            { k: '25', v: 'Miembros' },
            { k: '#USA1N5', v: 'HASH' },
            { k: '386068', v: 'Contacto' },
          ].map((s) => (
            <div key={s.v} data-h-stat>
              <dt className="font-heading text-3xl font-700 text-primary sm:text-4xl">
                {s.k}
              </dt>
              <dd className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
