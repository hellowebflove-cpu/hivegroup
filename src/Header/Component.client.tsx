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
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
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
      className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-8 lg:px-[52px] ${textColor}`}
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
          className="text-[16px] font-normal uppercase no-underline hover:opacity-70 transition-opacity duration-200 hidden md:block"
        >
          {center.text}
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
