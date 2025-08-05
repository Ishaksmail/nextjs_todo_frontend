"use client"

import { useEffect, useRef } from "react"
import { gsapUtils } from "@/lib/gsap-utils"
import { cn } from "@/lib/utils"

interface GSAPLoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function GSAPLoadingSpinner({ size = "md", className }: GSAPLoadingSpinnerProps) {
  const spinnerRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  useEffect(() => {
    if (spinnerRef.current) {
      gsapUtils.loadingSpinner(spinnerRef.current)
    }
  }, [])

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
      <div 
        ref={spinnerRef}
        className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent"
      />
    </div>
  )
}
