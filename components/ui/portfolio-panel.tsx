"use client"

import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

interface PortfolioPanelProps extends ComponentPropsWithoutRef<"div"> {
  innerClassName?: string
}

export function PortfolioPanel({ className, innerClassName, children, ...props }: PortfolioPanelProps) {
  return (
    <div className={cn("portfolio-shell animate-panel-reveal", className)} {...props}>
      <div className={cn("portfolio-inner", innerClassName)}>{children}</div>
    </div>
  )
}
