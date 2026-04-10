import React from 'react'

export const ServicesSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-white text-black px-6 py-20">
      <p className="text-[11px] leading-[13px] font-normal uppercase text-[#282828] text-center max-w-[854px] mb-16">
        Creation of unique restaurant concepts worldwide.
      </p>

      <div className="flex flex-col items-center gap-[10px] mb-16 text-center text-[20px] md:text-[33px] leading-[1.2] font-normal uppercase text-black">
        <p>Restaurant concept</p>
        <p>Development and branding</p>
        <p>Staff recruitment</p>
        <p>Training</p>
        <p>Management</p>
      </div>

      <p className="text-[11px] leading-[13px] font-normal uppercase text-black text-center max-w-[923px]">
        Our Mission is to create unique restaurant concepts that blend cultural heritage with
        contemporary trends. We aim to be leaders in hospitality innovation, offering our guests
        fresh, memorable experiences in each of our venues.
      </p>
    </section>
  )
}
