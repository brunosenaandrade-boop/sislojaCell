'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

interface PatternLockProps {
  value?: number[]
  onChange?: (sequence: number[]) => void
  readOnly?: boolean
  size?: number
}

// Posições dos 9 pontos no grid 3x3 (1-9)
// 1 2 3
// 4 5 6
// 7 8 9
const getPointPosition = (point: number, size: number) => {
  const padding = size * 0.15
  const usable = size - padding * 2
  const col = ((point - 1) % 3)
  const row = Math.floor((point - 1) / 3)
  return {
    x: padding + col * (usable / 2),
    y: padding + row * (usable / 2),
  }
}

export function PatternLock({ value, onChange, readOnly = false, size = 200 }: PatternLockProps) {
  const [sequence, setSequence] = useState<number[]>(value || [])

  const currentSequence = value !== undefined ? value : sequence

  const handlePointClick = useCallback((point: number) => {
    if (readOnly) return
    if (currentSequence.includes(point)) return

    const newSeq = [...currentSequence, point]
    setSequence(newSeq)
    onChange?.(newSeq)
  }, [currentSequence, readOnly, onChange])

  const handleClear = useCallback(() => {
    if (readOnly) return
    setSequence([])
    onChange?.([])
  }, [readOnly, onChange])

  const points = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const pointRadius = size * 0.055
  const activeRadius = size * 0.075

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
        >
          {/* Linhas conectando os pontos */}
          {currentSequence.length > 1 && currentSequence.map((point, index) => {
            if (index === 0) return null
            const from = getPointPosition(currentSequence[index - 1], size)
            const to = getPointPosition(point, size)
            return (
              <line
                key={`line-${index}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.7}
              />
            )
          })}

          {/* Pontos */}
          {points.map(point => {
            const pos = getPointPosition(point, size)
            const isActive = currentSequence.includes(point)
            const orderIndex = currentSequence.indexOf(point)

            return (
              <g key={point}>
                {/* Anel externo quando ativo */}
                {isActive && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={activeRadius}
                    fill="hsl(217, 91%, 60%)"
                    opacity={0.15}
                  />
                )}
                {/* Ponto principal */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isActive ? pointRadius * 1.3 : pointRadius}
                  fill={isActive ? 'hsl(217, 91%, 60%)' : 'hsl(var(--muted-foreground))'}
                  opacity={isActive ? 1 : 0.4}
                  className={!readOnly ? 'cursor-pointer' : ''}
                  onClick={() => handlePointClick(point)}
                />
                {/* Número de ordem */}
                {isActive && (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={size * 0.045}
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {orderIndex + 1}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Áreas clicáveis invisíveis maiores para facilitar o toque */}
        {!readOnly && points.map(point => {
          const pos = getPointPosition(point, size)
          const hitSize = size * 0.2
          return (
            <button
              key={`hit-${point}`}
              type="button"
              className="absolute rounded-full"
              style={{
                left: pos.x - hitSize / 2,
                top: pos.y - hitSize / 2,
                width: hitSize,
                height: hitSize,
              }}
              onClick={() => handlePointClick(point)}
              tabIndex={-1}
            />
          )
        })}
      </div>

      {/* Controles */}
      {!readOnly && (
        <div className="flex items-center gap-3">
          {currentSequence.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Limpar
            </Button>
          )}
          {currentSequence.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {currentSequence.length} ponto{currentSequence.length !== 1 ? 's' : ''} selecionado{currentSequence.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Sequência em modo visualização */}
      {readOnly && currentSequence.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Sequência: {currentSequence.join(' → ')}
        </p>
      )}
    </div>
  )
}
