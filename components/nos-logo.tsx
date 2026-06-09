import Image from 'next/image'
import { cn } from '@/lib/utils'

export function NosLogo({
  className,
  showText = false,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/nos-logo.png"
        alt="NOS — Nitrous Oxide System"
        width={96}
        height={54}
        priority
        className="h-8 w-auto object-contain"
      />
      {showText && (
        <span className="sr-only">NOS — Nitrous Oxide System</span>
      )}
    </span>
  )
}
