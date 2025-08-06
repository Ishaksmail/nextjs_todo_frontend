"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import { Sparkles, ArrowLeft, Mail } from "lucide-react"
import { gsapUtils } from "@/lib/gsap-utils"
import gsap from "gsap"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoadingL, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const { post } = useApi()
  const router = useRouter()

  const { user,isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Refs for animations
  const pageRef = useRef<HTMLDivElement>(null)
  const backLinkRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const brandHeaderRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const formItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const footerLinksRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Create a GSAP context to safely manage animations
    const ctx = gsap.context(() => {
      // Page enter animation
      if (pageRef.current) {
        gsapUtils.pageEnter(pageRef.current)
      }

      // Staggered animations
      if (backLinkRef.current) {
        gsapUtils.fadeIn(backLinkRef.current, 0.2)
      }

      if (brandHeaderRef.current) {
        gsapUtils.fadeIn(brandHeaderRef.current, 0.4)
      }

      if (cardRef.current) {
        gsapUtils.fadeIn(cardRef.current, 0.6)
      }

      // Logo animation
      if (logoRef.current) {
        gsap.fromTo(logoRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: "back.out(1.7)" }
        )
      }

      // Form items animation
      const validFormItems = formItemsRef.current.filter(Boolean) as HTMLElement[]
      if (validFormItems.length > 0) {
        gsapUtils.staggerIn(validFormItems, 0.8)
      }

      // Button animation
      if (submitButtonRef.current) {
        gsapUtils.fadeIn(submitButtonRef.current, 1.1)
      }

      // Footer links animation
      if (footerLinksRef.current) {
        gsapUtils.fadeIn(footerLinksRef.current, 1.2)
      }
    })

    // Cleanup function
    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await post("/api/user/forgot-password", { email })

      // Success animation before showing success state
      if (cardRef.current) {
        await gsapUtils.fadeOut(cardRef.current)
      }

      setIsSubmitted(true)
      toast({
        title: "Success",
        description: "Password reset instructions sent to your email!",
      })
    } catch (error) {
      // Error shake animation
      if (cardRef.current) {
        gsapUtils.shake(cardRef.current)
      }

      toast({
        title: "Error",
        description: "Failed to send reset instructions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div ref={backLinkRef} className="absolute top-6 left-6 opacity-0">
          <Link
            href="/login"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            onMouseEnter={() => arrowRef.current && gsap.to(arrowRef.current, { x: -4, duration: 0.2 })}
            onMouseLeave={() => arrowRef.current && gsap.to(arrowRef.current, { x: 0, duration: 0.2 })}
          >
            <ArrowLeft ref={arrowRef} className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div ref={brandHeaderRef} className="text-center mb-8 opacity-0">
            <div ref={logoRef} className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Check your email
            </h1>
            <p className="text-gray-600 mt-2">We've sent password reset instructions to {email}</p>
          </div>

          <Card ref={cardRef} className="shadow-xl border-0 opacity-0">
            <CardContent className="p-6 text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Back to login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div ref={backLinkRef} className="absolute top-6 left-6 opacity-0">
        <Link
          href="/login"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          onMouseEnter={() => arrowRef.current && gsap.to(arrowRef.current, { x: -4, duration: 0.2 })}
          onMouseLeave={() => arrowRef.current && gsap.to(arrowRef.current, { x: 0, duration: 0.2 })}
        >
          <ArrowLeft ref={arrowRef} className="h-4 w-4 mr-2" />
          Back to Login
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div ref={brandHeaderRef} className="text-center mb-8 opacity-0">
          <div ref={logoRef} className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Forgot password?
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Card ref={cardRef} className="shadow-xl border-0 opacity-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Reset Password</CardTitle>
            <CardDescription className="text-center text-gray-600">We'll send you reset instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                ref={el => { if (el) formItemsRef.current[0] = el }}
                className="space-y-2 opacity-0"
              >
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                ref={submitButtonRef}
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-medium"
                disabled={isLoadingL}
                onMouseDown={(e) => gsapUtils.buttonPress(e.currentTarget)}
                onMouseUp={(e) => gsapUtils.buttonRelease(e.currentTarget)}
                onMouseLeave={(e) => gsapUtils.buttonRelease(e.currentTarget)}
              >
                {isLoadingL ? "Sending..." : "Send reset instructions"}
              </Button>
            </form>

            <div ref={footerLinksRef} className="text-center text-sm text-gray-600 opacity-0">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}