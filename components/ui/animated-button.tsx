"use client"

import type React from "react"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
  children: React.ReactNode
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, children, ...props }, ref) => {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
        <Button
          ref={ref}
          variant={variant}
          size={size}
          disabled={loading || props.disabled}
          className={cn(
            "relative overflow-hidden transition-all duration-200",
            loading && "cursor-not-allowed",
            className,
          )}
          {...props}
        >
          <motion.div
            className="flex items-center justify-center"
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>

          {loading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <LoadingSpinner size="sm" />
            </motion.div>
          )}
        </Button>
      </motion.div>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"
