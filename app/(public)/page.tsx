import { HomeHero } from '@/components/home/home-hero'
import { Marquee } from '@/components/marquee'
import { ServicesSection } from '@/components/home/services-section'
import { FeatureSplit } from '@/components/home/feature-split'
import { CtaSection } from '@/components/home/cta-section'
import { LoadingScreen } from '@/components/loading-screen'

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <main id="main-content" className="will-change-transform">
        <HomeHero />
        <Marquee text="NITROUS OXIDE SYSTEM · DEL PERRO BEACH · PERFORMANCE · TUNING · REPARACIÓN" />
        <ServicesSection />
        <FeatureSplit />
        <CtaSection />
      </main>
    </>
  )
}
