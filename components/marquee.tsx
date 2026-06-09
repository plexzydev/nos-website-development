'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, gsap } from '@/lib/gsap'

export function Marquee({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsap()
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.to('[data-track]', {
        xPercent: -50,
        repeat: -1,
        duration: 18,
        ease: 'none',
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const items = Array.from({ length: 8 })

  return (
    <div
      ref={root}
      className="relative overflow-hidden border-y border-border bg-primary py-4 text-primary-foreground"
    >
      <div data-track className="flex w-max items-center gap-8">
        {items.concat(items).map((_, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-heading text-lg font-700 uppercase tracking-widest"
          >
            {text}
            <span aria-hidden className="text-2xl">
              ›
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
