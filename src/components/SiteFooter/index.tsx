import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'

const FALLBACK = {
  paragraphs: [
    'We have a strong intuition for understanding what our guests want and we strive to blend this insight with our passion for quality, comfort and creativity.',
    'Our journey is about building connections, crafting experiences, and making place where everyone feels welcome.',
  ],
  ctaText: 'See all projects',
  ctaUrl: '/projects',
  cooperationHeading: "Let's cooperate",
  contacts: [
    {
      label: 'Work in Hive',
      linkText: 'hr.hivegroup@gmail.com',
      linkUrl: 'mailto:hr.hivegroup@gmail.com',
      opensInNewTab: false,
    },
    {
      label: 'Invest with us',
      linkText: 'hi.hivegroup@gmail.com',
      linkUrl: 'mailto:hi.hivegroup@gmail.com',
      opensInNewTab: false,
    },
    {
      label: null as string | null,
      linkText: '@hivegroup.ltd',
      linkUrl: 'https://instagram.com/hivegroup.ltd',
      opensInNewTab: true,
    },
  ],
}

type FooterData = {
  aboutParagraphs?: { text: string }[] | null
  ctaText?: string | null
  ctaUrl?: string | null
  cooperationHeading?: string | null
  contacts?:
    | {
        label?: string | null
        linkText: string
        linkUrl: string
        opensInNewTab?: boolean | null
      }[]
    | null
}

export const SiteFooter: React.FC = async () => {
  const data = (await getCachedGlobal('site-footer', 1)().catch(() => null)) as FooterData | null

  const paragraphs =
    data?.aboutParagraphs?.length
      ? data.aboutParagraphs.map((p) => p.text).filter(Boolean)
      : FALLBACK.paragraphs
  const ctaText = data?.ctaText?.trim() || FALLBACK.ctaText
  const ctaUrl = data?.ctaUrl?.trim() || FALLBACK.ctaUrl
  const cooperationHeading = data?.cooperationHeading?.trim() || FALLBACK.cooperationHeading
  const contacts =
    data?.contacts?.length
      ? data.contacts.map((c) => ({
          label: c.label?.trim() || null,
          linkText: c.linkText,
          linkUrl: c.linkUrl,
          opensInNewTab: !!c.opensInNewTab,
        }))
      : FALLBACK.contacts

  return (
    <footer className="bg-white text-black">
      {/* About text + CTA */}
      <div className="flex flex-col items-center text-center px-6 lg:px-[52px] pt-24 pb-20">
        {paragraphs.map((text, i) => (
          <p
            key={i}
            className={`text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase max-w-[700px] ${
              i === paragraphs.length - 1 ? 'mb-10' : 'mb-4'
            }`}
          >
            {text}
          </p>
        ))}
        <a
          href={ctaUrl}
          className="inline-flex items-center justify-center h-[37px] px-5 border border-black rounded-full text-[15px] font-normal uppercase text-black hover:bg-black/5 transition-colors duration-200 no-underline"
        >
          {ctaText}
        </a>
      </div>

      {/* Divider */}
      <div className="mx-6 lg:mx-[52px] border-t border-black/10" />

      {/* LET'S COOPERATE */}
      <div className="px-6 lg:px-[52px] pt-16 pb-8">
        <h2 className="text-[28px] md:text-[46px] leading-[1] font-normal uppercase tracking-normal mb-8">
          {cooperationHeading}
        </h2>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              {c.label && (
                <span className="text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase">
                  {c.label}
                </span>
              )}
              <a
                href={c.linkUrl}
                {...(c.opensInNewTab
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className={`text-[13px] md:text-[15px] leading-[1.18] font-normal uppercase ${
                  c.label
                    ? 'underline underline-offset-2 decoration-1 hover:opacity-70'
                    : 'no-underline hover:opacity-70'
                } transition-opacity duration-200`}
              >
                {c.linkText}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-8" />
    </footer>
  )
}
