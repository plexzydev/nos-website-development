'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Wrench } from 'lucide-react'
import { NosLogo } from '@/components/nos-logo'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/equipo', label: 'Equipo' },
  { href: '/informacion', label: 'Más información' },
  { href: '/foro', label: 'Foro' },
  { href: '/terminos', label: 'TyC' },
]

export function Navbar({ user }: { user?: { name?: string | null, image?: string | null } | null }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={cn(
          'flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border px-4 py-2.5 transition-all duration-300 sm:px-5',
          scrolled
            ? 'border-border bg-card/80 shadow-lg shadow-black/30 backdrop-blur-xl'
            : 'border-transparent bg-card/40 backdrop-blur-md',
        )}
      >
        <Link
          href="/"
          aria-label="NOS — Inicio"
          className="flex items-center"
        >
          <NosLogo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-primary/10 ring-1 ring-primary/30" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/panel"
              className="hidden items-center gap-2.5 rounded-full border border-border bg-secondary/80 pl-1.5 pr-4 py-1.5 transition-all hover:bg-secondary hover:scale-[1.03] active:scale-95 sm:flex"
            >
              {user.image ? (
                <img src={user.image} alt={user.name || 'Avatar'} className="size-7 rounded-full object-cover ring-1 ring-border" />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary ring-1 ring-primary/30">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-sm font-semibold">{user.name?.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link
              href="/panel"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 sm:flex"
            >
              <Wrench className="size-4" />
              Panel
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-secondary text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute inset-x-4 top-20 rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur-xl md:hidden">
          {LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block rounded-xl px-4 py-3 text-sm font-medium',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}
          {user ? (
            <Link
              href="/panel"
              className="mt-1 flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              {user.image ? (
                <img src={user.image} alt={user.name || 'Avatar'} className="size-6 rounded-full object-cover" />
              ) : (
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              {user.name}
            </Link>
          ) : (
            <Link
              href="/panel"
              className="mt-1 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Wrench className="size-4" />
              Panel de mecánico
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
