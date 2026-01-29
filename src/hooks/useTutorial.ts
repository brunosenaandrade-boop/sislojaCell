'use client'

import { useContext } from 'react'
import { TutorialContext } from '@/components/tutorial/TutorialProvider'

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial deve ser usado dentro de um TutorialProvider')
  }
  return context
}
