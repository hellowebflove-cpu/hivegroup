'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

interface HeaderClientProps {
  data: Header
}

const FALLBACK = {
  left: { text: 'Contacts', url: '/contacts' },
  center: { text: 'Hive Group®', url: '/' },
  right: { text: 'Projects', url: '/projects' },
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname])

  useEffect(() => {
    if (headerTheme !== theme) setTheme(headerTheme || null)
  }, [headerTheme])

  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const isHome = pathname === '/'

  const left = {
    text: data.leftLink?.text?.trim() || FALLBACK.left.text,
    url: data.leftLink?.url?.trim() || FALLBACK.left.url,
  }
  const center = {
    text: data.centerLink?.text?.trim() || FALLBACK.center.text,
    url: data.centerLink?.url?.trim() || FALLBACK.center.url,
  }
  const right = {
    text: data.rightLink?.text?.trim() || FALLBACK.right.text,
    url: data.rightLink?.url?.trim() || FALLBACK.right.url,
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-start pt-[33px] justify-between px-8 lg:px-[52px] transition-colors duration-300 ${textColor}`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <Link
        href={left.url}
        className="text-[16px] font-normal uppercase no-underline hover:opacity-70 transition-opacity duration-200"
      >
        {left.text}
      </Link>
      {!isHome && (
        <Link
          href={center.url}
          aria-label="Hive Group"
          className="absolute left-1/2 -translate-x-1/2 top-[12px] hidden md:block hover:opacity-70 transition-opacity duration-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/hive-group.png"
            alt="Hive Group"
            width={878}
            height={127}
            className="block w-[221px] h-auto"
            style={{ filter: isDark ? 'none' : 'invert(1)' }}
            draggable={false}
          />
        </Link>
      )}
      <Link
        href={right.url}
        className="text-[16px] font-normal uppercase no-underline hover:opacity-70 transition-opacity duration-200"
      >
        {right.text}
      </Link>
    </header>
  )
}
