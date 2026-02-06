'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { tutorialSteps, type TutorialStep } from '@/data/tutorialSteps'

export interface TutorialContextType {
  isActive: boolean
  currentStep: number
  completedSteps: Set<string>
  steps: TutorialStep[]
  currentStepData: TutorialStep | null
  startTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  skipTutorial: () => void
  closeTutorial: () => void
}

export const TutorialContext = createContext<TutorialContextType | null>(null)

const TUTORIAL_COMPLETED_KEY = 'tutorial-completed'

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  // Auto-start on first access
  useEffect(() => {
    if (hasAutoStarted) return
    setHasAutoStarted(true)

    try {
      const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY)
      if (!completed) {
        // Small delay to let the page render first
        const timer = setTimeout(() => {
          setIsActive(true)
          setCurrentStep(0)
        }, 1000)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage may be unavailable
    }
  }, [hasAutoStarted])

  const currentStepData = isActive ? tutorialSteps[currentStep] ?? null : null

  // Navigate to the correct page when step changes
  useEffect(() => {
    if (!isActive || !currentStepData) return

    const targetPage = currentStepData.page
    if (pathname !== targetPage) {
      router.push(targetPage)
    }
  }, [isActive, currentStep, currentStepData, pathname, router])

  const startTutorial = useCallback(() => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setIsActive(true)
  }, [])

  const nextStep = useCallback(() => {
    const step = tutorialSteps[currentStep]
    if (step) {
      setCompletedSteps((prev) => new Set(prev).add(step.id))
    }

    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // Last step - complete tutorial
      setIsActive(false)
      try {
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true')
      } catch {
        // localStorage may be unavailable
      }
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const skipTutorial = useCallback(() => {
    setIsActive(false)
    try {
      localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true')
    } catch {
      // localStorage may be unavailable
    }
  }, [])

  const closeTutorial = useCallback(() => {
    setIsActive(false)
  }, [])

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        completedSteps,
        steps: tutorialSteps,
        currentStepData,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        closeTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return {
    iniciarTutorial: context.startTutorial,
    isActive: context.isActive,
    currentStep: context.currentStep,
    currentStepData: context.currentStepData,
  }
}
