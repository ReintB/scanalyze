"use client"

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from './button'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {isVisible && (
        <Button
          className="fixed bottom-8 right-8 z-50 rounded-full p-3 shadow-lg transition-all duration-300 hover:shadow-xl"
          onClick={scrollToTop}
          size="icon"
          variant="outline"
        >
          <ChevronUp className="size-5" />
          <span className="sr-only">Scroll to top</span>
        </Button>
      )}
    </>
  )
} 