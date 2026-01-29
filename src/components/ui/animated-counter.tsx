'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
}

export function AnimatedCounter({ value, duration = 1000, formatter, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const startValue = previousValue.current
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)

      const current = startValue + (value - startValue) * eased
      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = value
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [value, duration])

  const formatted = formatter ? formatter(displayValue) : displayValue.toFixed(0)

  return <span className={className}>{formatted}</span>
}
