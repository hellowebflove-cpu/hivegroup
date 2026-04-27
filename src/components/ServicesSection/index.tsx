import React from 'react'

export const ServicesSection: React.FC = () => {
  return (
    <section className="relative flex flex-col items-center bg-white text-black px-6 pt-[124px] lg:pt-[156px] pb-[60px]">
      <div className="flex flex-col items-center gap-[13px] text-center text-[20px] md:text-[33px] leading-[1] font-normal uppercase text-black">
        <p>Restaurant concept</p>
        <p>Development and branding</p>
        <p>Staff recruitment</p>
        <p>Training</p>
        <p>Management</p>
      </div>

      <p className="mt-[60px] text-[11px] leading-[13px] font-normal uppercase text-black text-center max-w-[923px]">
        Our Mission is to create unique restaurant concepts that blend cultural heritage with
        contemporary trends. We aim to be leaders in hospitality innovation, offering our guests
        fresh, memorable experiences in each of our venues.
      </p>
    </section>
  )
}
