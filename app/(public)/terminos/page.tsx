import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { RevealGroup } from '@/components/reveal-group'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description:
    'Términos y condiciones de uso de los servicios del taller NOS en Los Santos.',
}

const SECTIONS = [
  {
    title: '1. Sobre NOS',
    body: 'NOS (Nitrous Oxide System, Inc.) es un taller mecánico de carácter recreativo y de rol ubicado en Del Perro Beach, Los Santos. Este sitio y sus servicios forman parte de una comunidad y no representan a la marca comercial real NOS.',
  },
  {
    title: '2. Servicios',
    body: 'Los servicios de reparación, performance, tuning e instalación de sistemas se prestan según disponibilidad del equipo. Los precios y tiempos pueden variar según el trabajo solicitado y se acuerdan previamente con el cliente.',
  },
  {
    title: '3. Responsabilidad',
    body: 'El cliente es responsable de brindar información veraz sobre el estado de su vehículo. NOS no se hace responsable por daños derivados de información incompleta, modificaciones previas no declaradas o uso indebido posterior al servicio.',
  },
  {
    title: '4. Acceso del personal',
    body: 'El acceso al panel interno está reservado exclusivamente a los mecánicos verificados de NOS. La verificación se realiza mediante inicio de sesión con Discord y la posesión del rol correspondiente dentro del servidor oficial #USA1N5.',
  },
  {
    title: '5. Vinculación de cuentas',
    body: 'Los mecánicos deben vincular su cuenta de Discord utilizando el comando /linkaccount. El uso indebido del sistema, la suplantación de identidad o el acceso no autorizado pueden derivar en la revocación inmediata del acceso.',
  },
  {
    title: '6. Privacidad',
    body: 'Únicamente almacenamos los datos necesarios para identificar a los mecánicos (identificador de Discord, nombre de usuario y rol). No compartimos esta información con terceros ajenos a la comunidad.',
  },
  {
    title: '7. Modificaciones',
    body: 'NOS se reserva el derecho de actualizar estos términos en cualquier momento. Los cambios se reflejarán en esta página y entrarán en vigencia desde su publicación.',
  },
]

export default function TerminosPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Términos y
            <br />
            <span className="text-primary">Condiciones</span>
          </>
        }
        description="Las reglas que rigen el uso de nuestros servicios y del sistema interno de NOS."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <RevealGroup className="space-y-8" stagger={0.06}>
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              data-reveal
              className="border-l-2 border-primary/40 pl-6"
            >
              <h2 className="font-heading text-xl font-600 uppercase tracking-wide">
                {s.title}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}

          <p data-reveal className="pt-4 text-xs text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </p>
        </RevealGroup>
      </section>
    </>
  )
}
