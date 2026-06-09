'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * Reveals direct children (or [data-reveal] descendants) with a staggered
 * slide-up + fade as they scroll into view.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  y?: number
  stagger?: number
  start?: string
  selector?: string
}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return

    const targets = options?.selector
      ? el.querySelectorAll(options.selector)
      : el.querySelectorAll('[data-reveal]')

    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 1 })
      gsap.from(targets, {
        y: options?.y ?? 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: options?.stagger ?? 0.12,
        scrollTrigger: {
          trigger: el,
          start: options?.start ?? 'top 80%',
        },
      })
    }, el)

    return () => ctx.revert()
  }, [options?.y, options?.stagger, options?.start, options?.selector])

  return ref
}

export { gsap, ScrollTrigger }
