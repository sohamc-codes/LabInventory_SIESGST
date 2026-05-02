import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary hover:bg-primary/30",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        outline:
          "border-border text-foreground bg-transparent",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25",
        warning:
          "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25",
        info:
          "border-transparent bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }