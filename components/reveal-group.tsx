'use client'

import { type ReactNode, type ElementType } from 'react'
import { useReveal } from '@/hooks/use-reveal'
import { cn } from '@/lib/utils'

/**
 * Wraps content and reveals any [data-reveal] children on scroll.
 */
export function RevealGroup({
  children,
  className,
  as: Tag = 'div',
  stagger,
  y,
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  stagger?: number
  y?: number
}) {
  const ref = useReveal<HTMLDivElement>({ stagger, y })
  return (
    <Tag ref={ref} className={cn('js-reveal', className)}>
      {children}
    </Tag>
  )
}
