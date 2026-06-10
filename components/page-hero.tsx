import type { ReactNode } from 'react'
import Image from 'next/image'
import { RevealGroup } from '@/components/reveal-group'

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  heroImage,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  children?: ReactNode
  heroImage?: { src: string; alt: string }
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-grid">
      <div className="pointer-events-none absolute -right-24 top-1/2 hidden h-[140%] w-[40%] -translate-y-1/2 -skew-x-12 bg-primary/[0.04] md:block" />
      
      {heroImage && (
        <div className="pointer-events-none absolute right-[-10%] top-[40%] hidden w-[60%] -translate-y-1/2 select-none md:block xl:right-[0%] xl:w-[50%]">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={1200}
            height={600}
            className="h-auto w-full object-contain drop-shadow-2xl"
            priority
          />
        </div>
      )}

      <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-32 sm:pt-40">
        <RevealGroup className="max-w-3xl">
          <p
            data-reveal
            className="font-heading text-sm font-600 uppercase tracking-[0.3em] text-primary"
          >
            {eyebrow}
          </p>
          <h1
            data-reveal
            className="mt-4 font-heading text-5xl font-700 uppercase leading-[0.95] tracking-tight text-balance sm:text-7xl"
          >
            {title}
          </h1>
          {description && (
            <p
              data-reveal
              className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty"
            >
              {description}
            </p>
          )}
          {children && <div data-reveal className="mt-8">{children}</div>}
        </RevealGroup>
      </div>
    </section>
  )
}
