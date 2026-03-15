import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-dark-4 bg-dark-4 text-white shadow-sm hover:-translate-y-0.5 hover:bg-black hover:shadow-lg dark:border-dark-5/30 dark:bg-white dark:text-dark-4 dark:hover:bg-zinc-100",
        destructive:
          "border border-red-500/40 bg-destructive text-destructive-foreground hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-border/80 bg-background/70 text-foreground shadow-sm backdrop-blur-xl hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/70 dark:border-dark-5/35 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/90",
        ghost: "text-foreground/80 hover:bg-accent/70 hover:text-foreground dark:hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
