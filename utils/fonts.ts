'use client'

import { useEffect, useState } from 'react'

// Keeps track of loaded fonts to prevent duplicate loading
const loadedFonts = new Set<string>()

export function useGoogleFont(fontFamily: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const fontId = fontFamily.replace(/\s+/g, '+')
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && !loadedFonts.has(fontId)) {
      // Create and append link element
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontId}:wght@300;400;500;600;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
      loadedFonts.add(fontId)
      setIsLoaded(true)
    }
  }, [fontId])

  // Return the CSS font-family value
  return `"${fontFamily}", sans-serif`
}