'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname])

  useEffect(() => {
    if (headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme])

  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-8 lg:px-[52px] ${textColor}`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <Link
        href="/contacts"
        className="text-[15px] font-normal uppercase no-underline hover:opacity-70 transition-opacity duration-200"
      >
        Contacts
      </Link>
      <Link
        href="/"
        className="text-[15px] font-normal uppercase no-underline hover:opacity-70 transition-opacity duration-200 hidden md:block"
      >
        Hive Group&reg;
      </Link>
      <Link
        href="/projects"
        className="text-[15px] font-normal uppercase no-underline hover:opacity-70 transition-opacity duration-200"
      >
        Projects
      </Link>
    </header>
  )
}
