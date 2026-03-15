"use client"

import { useEffect, useId, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Square {
  id: number
  pos: [number, number]
}

interface GridPatternProps {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: number | string
  numSquares?: number
  className?: string
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
}

function generateSquares(
  count: number,
  dimensions: { width: number; height: number },
  cellWidth: number,
  cellHeight: number,
) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    pos: [
      Math.floor((Math.random() * dimensions.width) / cellWidth),
      Math.floor((Math.random() * dimensions.height) / cellHeight),
    ] as [number, number],
  }))
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 10,
  numSquares = 45,
  className,
  maxOpacity = 0.1,
  duration = 5,
  repeatDelay,
}: GridPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [squares, setSquares] = useState<Square[]>([])

  const getNextPos = (): [number, number] => [
    Math.floor((Math.random() * dimensions.width) / width),
    Math.floor((Math.random() * dimensions.height) / height),
  ]

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares, dimensions, width, height))
    }
  }, [dimensions, numSquares, width, height])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-zinc-500/20 stroke-black/10 dark:fill-zinc-300/5 dark:stroke-zinc-300/20",
        className,
      )}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} />

      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id: squareId }, index) => (
          <motion.rect
            key={`${squareId}-${squareX}-${squareY}`}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            fill="currentColor"
            strokeWidth="0"
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              repeatType: "reverse",
              delay: index * 0.1,
              repeatDelay,
            }}
            onAnimationComplete={() => {
              setSquares((current) =>
                current.map((square) =>
                  square.id === squareId
                    ? {
                        ...square,
                        pos: getNextPos(),
                      }
                    : square,
                ),
              )
            }}
          />
        ))}
      </svg>
    </svg>
  )
}

export default GridPattern
