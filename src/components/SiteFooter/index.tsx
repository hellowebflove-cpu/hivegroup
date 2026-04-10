import React from 'react'

export const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-white text-black">
      {/* About text + CTA */}
      <div className="flex flex-col items-center text-center px-6 lg:px-[52px] pt-24 pb-20">
        <p className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase max-w-[700px] mb-4">
          We have a strong intuition for understanding what our guests want
          and we strive to blend this insight with our passion
          for quality, comfort and creativity.
        </p>
        <p className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase max-w-[700px] mb-10">
          Our journey is about building connections, crafting
          experiences, and making place where everyone feels welcome.
        </p>
        <a
          href="/projects"
          className="inline-flex items-center justify-center h-[37px] px-5 border border-black rounded-full text-[15px] font-normal uppercase text-black hover:bg-black/5 transition-colors duration-200 no-underline"
        >
          See all projects
        </a>
      </div>

      {/* Divider */}
      <div className="mx-6 lg:mx-[52px] border-t border-black/10" />

      {/* LET'S COOPERATE */}
      <div className="px-6 lg:px-[52px] pt-16 pb-8">
        <h2 className="text-[28px] md:text-[46px] leading-[1] font-normal uppercase tracking-normal mb-8">
          Let&apos;s cooperate
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase">
              Work in Hive
            </span>
            <a
              href="mailto:hr.hivegroup@gmail.com"
              className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity duration-200"
            >
              hr.hivegroup@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase">
              Invest with us
            </span>
            <a
              href="mailto:hi.hivegroup@gmail.com"
              className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase underline underline-offset-2 decoration-1 hover:opacity-70 transition-opacity duration-200"
            >
              hi.hivegroup@gmail.com
            </a>
          </div>

          <a
            href="https://instagram.com/hivegroup.ltd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase no-underline hover:opacity-70 transition-opacity duration-200"
          >
            @hivegroup.ltd
          </a>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-8" />
    </footer>
  )
}
