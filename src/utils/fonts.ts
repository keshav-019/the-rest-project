'use client'
import { useEffect } from 'react'

// Keeps track of loaded fonts to prevent duplicate loading
const loadedFonts = new Set<string>()

export function useGoogleFont(fontFamily: string): string {
  const fontId = fontFamily.replace(/\s+/g, '+')
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && !loadedFonts.has(fontId)) {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontId}:wght@300;400;500;600;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
      loadedFonts.add(fontId)
    }
  }, [fontId])

  return `"${fontFamily}", sans-serif`
}