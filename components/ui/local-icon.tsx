"use client"

import type { SVGProps } from "react"
import { cn } from "@/lib/utils"

interface LocalIconProps extends SVGProps<SVGSVGElement> {
  name: string
  title?: string
}

export function LocalIcon({ name, className, title, children, ...props }: LocalIconProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      focusable="false"
      className={cn("h-4 w-4 shrink-0", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <use href={`/portfolio/icons/studio-icons.svg#${name}`} />
      {children}
    </svg>
  )
}

export default LocalIcon
