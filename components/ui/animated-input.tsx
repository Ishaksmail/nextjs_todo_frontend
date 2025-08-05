"use client"

import type React from "react"

import { useState, forwardRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {icon && (
            <motion.div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              animate={{
                color: isFocused ? "#3b82f6" : "#9ca3af",
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          <Input
            ref={ref}
            className={cn(
              "peer h-12 transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
              icon && "pl-10",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              className,
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(!!e.target.value)
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value)
              props.onChange?.(e)
            }}
            {...props}
          />

          <motion.div
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-all duration-200",
              icon && "left-10",
            )}
            animate={{
              y: isFocused || hasValue || props.value ? -32 : 0,
              scale: isFocused || hasValue || props.value ? 0.85 : 1,
              color: isFocused ? "#3b82f6" : error ? "#ef4444" : "#6b7280",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Label className="bg-white px-1 font-medium">{label}</Label>
          </motion.div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-red-500 text-sm mt-1 overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  },
)

AnimatedInput.displayName = "AnimatedInput"
