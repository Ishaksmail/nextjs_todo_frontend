"use client"

import { useEffect, useRef } from "react"
import { gsapUtils } from "@/lib/gsap-utils"

interface GSAPCounterProps {
  value: number
  duration?: number
  className?: string
}

export function GSAPCounter({ value, duration = 1, className }: GSAPCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef(0)

  useEffect(() => {
    if (counterRef.current) {
      gsapUtils.animateCounter(counterRef.current, prevValueRef.current, value, duration)
      prevValueRef.current = value
    }
  }, [value, duration])

  return <span ref={counterRef} className={className}>0</span>
}
