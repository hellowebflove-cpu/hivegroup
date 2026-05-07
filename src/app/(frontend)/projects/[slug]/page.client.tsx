'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEffect } from 'react'

export function SetDarkHeader() {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    const update = () => {
      // Switch to "light" header only when the Previous/Next nav (white section) is in view
      const nav = document.querySelector<HTMLElement>('nav[aria-label="Project navigation"]')
      if (!nav) {
        setHeaderTheme('dark')
        return
      }
      // Header is ~56px tall — once nav top crosses this line, swap theme
      const onLight = nav.getBoundingClientRect().top <= 56
      setHeaderTheme(onLight ? 'light' : 'dark')
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [setHeaderTheme])
  return null
}
