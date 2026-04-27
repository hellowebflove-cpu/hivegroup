'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEffect } from 'react'

export function HeaderThemeMark({ theme }: { theme: 'light' | 'dark' }) {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    setHeaderTheme(theme)
  }, [setHeaderTheme, theme])
  return null
}
