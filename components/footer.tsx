import Link from 'next/link'
import { NosLogo } from '@/components/nos-logo'
import { MapPin, Phone, Users } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/40">
      <div className="bg-grid">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <NosLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Nitrous Oxide System, Inc. ® — Taller mecánico en Del Perro
              Beach. Performance y reparación hechos por la comunidad, para la
              comunidad.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-600 uppercase tracking-widest text-primary">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/equipo', label: 'Equipo' },
                { href: '/informacion', label: 'Más información' },
                { href: '/terminos', label: 'Términos y Condiciones' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-600 uppercase tracking-widest text-primary">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Del Perro Beach, Los Santos
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                386068
              </li>
              <li className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                #USA1N5
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} NOS · Nitrous Oxide System, Inc.</p>
          <p>Proyecto de rol — Los Santos. No afiliado a la marca real.</p>
        </div>
      </div>
    </footer>
  )
}
