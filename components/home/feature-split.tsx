'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { registerGsap, gsap } from '@/lib/gsap'

export function FeatureSplit() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 })
      gsap.from('[data-fs-text] > *', {
        x: -40,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 75%' },
      })
      gsap.from('[data-fs-img]', {
        clipPath: 'inset(0 100% 0 0)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 75%' },
      })
      gsap.to('[data-fs-inner]', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="js-reveal border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <div data-fs-text>
          <p className="font-heading text-sm font-600 uppercase tracking-[0.3em] text-primary">
            La marca
          </p>
          <h2 className="mt-4 font-heading text-4xl font-700 uppercase leading-tight tracking-tight text-balance sm:text-5xl">
            Creado por amigos, para la comunidad
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            NOS nació de un grupo de apasionados por los fierros que querían un
            lugar donde la calidad mecánica y la cultura del motor convivieran.
            Hoy somos un equipo que pone el mismo cuidado en un cambio de aceite
            que en un build completo de competición.
          </p>
          <Link
            href="/nosotros"
            className="group mt-8 inline-flex items-center gap-2 font-heading text-sm font-600 uppercase tracking-wider text-primary"
          >
            Nuestra historia
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          data-fs-img
          className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border"
        >
          <div data-fs-inner className="absolute inset-0 scale-110">
            <Image
              src="/workshop-detail.png"
              alt="Detalle de motor con sistema NOS"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
