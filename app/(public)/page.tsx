import { HomeHero } from '@/components/home/home-hero'
import { Marquee } from '@/components/marquee'
import { ServicesSection } from '@/components/home/services-section'
import { FeatureSplit } from '@/components/home/feature-split'
import { CtaSection } from '@/components/home/cta-section'

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Marquee text="NITROUS OXIDE SYSTEM · DEL PERRO BEACH · PERFORMANCE · TUNING · REPARACIÓN" />
      <ServicesSection />
      <FeatureSplit />
      <CtaSection />
    </>
  )
}
