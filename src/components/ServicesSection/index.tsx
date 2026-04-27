import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'

const FALLBACK_SERVICES = [
  'Restaurant concept',
  'Development and branding',
  'Staff recruitment',
  'Training',
  'Management',
]

const FALLBACK_MISSION =
  'Our Mission is to create unique restaurant concepts that blend cultural heritage with contemporary trends. We aim to be leaders in hospitality innovation, offering our guests fresh, memorable experiences in each of our venues.'

export const ServicesSection = async () => {
  const home = (await getCachedGlobal('home-page', 1)().catch(() => null)) as
    | { services?: { label: string }[] | null; missionText?: string }
    | null

  const services = home?.services?.length
    ? home.services.map((s) => s.label).filter(Boolean)
    : FALLBACK_SERVICES
  const mission = home?.missionText?.trim() || FALLBACK_MISSION

  return (
    <section className="relative flex flex-col items-center bg-white text-black px-6 pt-[124px] lg:pt-[156px] pb-[60px]">
      <div className="flex flex-col items-center gap-[13px] text-center text-[20px] md:text-[33px] leading-[1] font-normal uppercase text-black">
        {services.map((label, i) => (
          <p key={i}>{label}</p>
        ))}
      </div>

      <p className="mt-[60px] text-[11px] leading-[13px] font-normal uppercase text-black text-center max-w-[923px]">
        {mission}
      </p>
    </section>
  )
}
