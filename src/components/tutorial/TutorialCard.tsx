'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTutorial } from '@/hooks/useTutorial'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface CardPosition {
  top: number
  left: number
}

export function TutorialCard() {
  const {
    isActive,
    currentStep,
    currentStepData,
    steps,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorial()

  const [position, setPosition] = useState<CardPosition>({ top: 0, left: 0 })
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [visible, setVisible] = useState(false)

  const calculatePosition = useCallback(() => {
    if (!currentStepData) return

    const el = document.querySelector(currentStepData.targetSelector)
    if (!el) return

    const rect = el.getBoundingClientRect()
    const cardWidth = 380
    const cardHeight = 280
    const gap = 16
    const padding = 8
    const edge = 12

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Target area including spotlight padding
    const targetTop = rect.top - padding
    const targetBottom = rect.bottom + padding
    const targetLeft = rect.left - padding
    const targetRight = rect.right + padding

    const positionCard = (pos: string) => {
      let t = 0
      let l = 0

      switch (pos) {
        case 'bottom':
          t = targetBottom + gap
          l = rect.left + rect.width / 2 - cardWidth / 2
          break
        case 'top':
          t = targetTop - gap - cardHeight
          l = rect.left + rect.width / 2 - cardWidth / 2
          break
        case 'right':
          t = rect.top + rect.height / 2 - cardHeight / 2
          l = targetRight + gap
          break
        case 'left':
          t = rect.top + rect.height / 2 - cardHeight / 2
          l = targetLeft - gap - cardWidth
          break
      }

      // Clamp to viewport
      if (l < edge) l = edge
      if (l + cardWidth > viewportWidth - edge) l = viewportWidth - cardWidth - edge
      if (t < edge) t = edge
      if (t + cardHeight > viewportHeight - edge) t = viewportHeight - cardHeight - edge

      return { t, l }
    }

    const overlaps = (t: number, l: number) => {
      return !(l + cardWidth <= targetLeft || l >= targetRight || t + cardHeight <= targetTop || t >= targetBottom)
    }

    // Try preferred position first, then fallback to alternatives
    const preferred = currentStepData.position
    const fallbacks = ['bottom', 'top', 'right', 'left'].filter(p => p !== preferred)
    const tryOrder = [preferred, ...fallbacks]

    let top = 0
    let left = 0
    let found = false

    for (const pos of tryOrder) {
      const { t, l } = positionCard(pos)
      if (!overlaps(t, l)) {
        top = t
        left = l
        found = true
        break
      }
    }

    // If all positions overlap, use the preferred but offset away from target
    if (!found) {
      const { t, l } = positionCard(preferred)
      top = t
      left = l
    }

    setPosition({ top, left })
    setVisible(true)
  }, [currentStepData])

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setVisible(false)
      return
    }

    setVisible(false)

    // Delay to allow page navigation and overlay to settle
    const timer = setTimeout(calculatePosition, 600)
    const timer2 = setTimeout(calculatePosition, 1100)

    window.addEventListener('scroll', calculatePosition, true)
    window.addEventListener('resize', calculatePosition)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      window.removeEventListener('scroll', calculatePosition, true)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [isActive, currentStepData, calculatePosition])

  const handleSkip = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('tutorial-completed', 'true')
      } catch {
        // ignore
      }
    }
    skipTutorial()
  }

  const handleFinish = () => {
    nextStep() // This will set completed in provider when it's the last step
  }

  if (!isActive || !currentStepData) return null

  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div
      className="fixed z-[9999] transition-all duration-500 ease-in-out"
      style={{
        top: position.top,
        left: position.left,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        pointerEvents: visible ? 'auto' : 'none',
        width: 380,
      }}
    >
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base leading-tight">
              {currentStepData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 -mt-1 -mr-2"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-center">
              {currentStep + 1} de {steps.length}
            </p>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="tutorial-dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) =>
                setDontShowAgain(checked === true)
              }
            />
            <label
              htmlFor="tutorial-dont-show"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Não mostrar novamente
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Pular
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={isFirstStep}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                size="sm"
                onClick={isLastStep ? handleFinish : nextStep}
              >
                {isLastStep ? 'Concluir' : 'Próximo'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
