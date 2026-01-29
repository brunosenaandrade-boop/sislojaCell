'use client'

import { useEffect, useState } from 'react'
import { useTutorial } from '@/hooks/useTutorial'

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function TutorialOverlay() {
  const { isActive, currentStepData } = useTutorial()
  const [rect, setRect] = useState<SpotlightRect | null>(null)

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setRect(null)
      return
    }

    const findElement = () => {
      const el = document.querySelector(currentStepData.targetSelector)
      if (el) {
        const domRect = el.getBoundingClientRect()
        const padding = 8
        setRect({
          top: domRect.top - padding,
          left: domRect.left - padding,
          width: domRect.width + padding * 2,
          height: domRect.height + padding * 2,
        })
      } else {
        setRect(null)
      }
    }

    // Try immediately and also after a short delay (for page navigation)
    findElement()
    const timer = setTimeout(findElement, 500)
    const timer2 = setTimeout(findElement, 1000)

    // Update on scroll or resize
    const handleUpdate = () => findElement()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isActive, currentStepData])

  if (!isActive || !rect) return null

  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-none"
      aria-hidden="true"
    >
      {/* Dark overlay with spotlight cutout using box-shadow */}
      <div
        className="absolute rounded-lg transition-all duration-500 ease-in-out"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
      />
      {/* Invisible click-blocking layer over the dark area (not over the spotlight) */}
      <div
        className="fixed inset-0 z-[9997] pointer-events-auto"
        onClick={(e) => {
          // Block clicks on the overlay area but allow clicks inside the spotlight
          const clickX = e.clientX
          const clickY = e.clientY
          if (
            clickX >= rect.left &&
            clickX <= rect.left + rect.width &&
            clickY >= rect.top &&
            clickY <= rect.top + rect.height
          ) {
            // Inside spotlight - let it pass through
            return
          }
          // Outside spotlight - block the click
          e.stopPropagation()
          e.preventDefault()
        }}
      />
    </div>
  )
}
