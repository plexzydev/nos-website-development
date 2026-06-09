import type { ReactNode } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { auth } from '@/auth'

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  return (
    <>
      <Navbar user={session?.user} />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
