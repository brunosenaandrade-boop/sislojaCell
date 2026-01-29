'use client'

import { usePathname } from 'next/navigation'
import { useTutorial } from '@/hooks/useTutorial'
import { quickTipsByPage } from '@/data/tutorialSteps'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { HelpCircle, Play, Lightbulb } from 'lucide-react'

export function HelpButton() {
  const { isActive, startTutorial } = useTutorial()
  const pathname = usePathname()

  // Don't show while tutorial is active
  if (isActive) return null

  const pageTips = quickTipsByPage[pathname]

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="w-80"
        >
          <div className="space-y-4">
            {/* Start tour button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={startTutorial}
            >
              <Play className="h-4 w-4 text-primary" />
              Iniciar Tour Guiado
            </Button>

            {/* Quick tips for current page */}
            {pageTips && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {pageTips.title}
                </div>
                <ul className="space-y-1.5">
                  {pageTips.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="text-xs text-muted-foreground pl-4 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-muted-foreground/40"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!pageTips && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Nenhuma dica disponível para esta página.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
