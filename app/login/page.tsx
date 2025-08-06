"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { Sparkles, ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react"
import { gsapUtils } from "@/lib/gsap-utils"
import gsap from "gsap"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoadingL, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login, user, isLoading } = useAuth()

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);


  // Refs for animations
  const pageRef = useRef<HTMLDivElement>(null)
  const backLinkRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const brandHeaderRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const eyeIconRef = useRef<SVGSVGElement>(null)
  const eyeOffIconRef = useRef<SVGSVGElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const footerLinksRef = useRef<HTMLDivElement>(null)
  const formItemsRef = useRef<(HTMLDivElement | null)[]>([])




  useEffect(() => {
    // Create a GSAP context to safely manage animations
    const ctx = gsap.context(() => {
      // Only animate if elements exist
      if (pageRef.current) {
        gsapUtils.pageEnter(pageRef.current)
      }

      if (backLinkRef.current) {
        gsapUtils.fadeIn(backLinkRef.current, 0.2)
      }

      if (brandHeaderRef.current) {
        gsapUtils.fadeIn(brandHeaderRef.current, 0.4)
      }

      if (cardRef.current) {
        gsapUtils.fadeIn(cardRef.current, 0.6)
      }






      if (logoRef.current) {
        gsap.fromTo(logoRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: "back.out(1.7)" }
        )
      }

      // Filter out null refs before animating
      const validFormItems = formItemsRef.current.filter(Boolean) as HTMLElement[]
      if (validFormItems.length > 0) {
        gsapUtils.staggerIn(validFormItems, 0.7)
      }

      if (submitButtonRef.current) {
        gsapUtils.fadeIn(submitButtonRef.current, 1)
      }

      if (footerLinksRef.current) {
        gsapUtils.fadeIn(footerLinksRef.current, 1.1)
      }
    })

    // Cleanup function
    return () => ctx.revert()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await login(formData.username, formData.password)

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to Climdo",
      })

      // Safely animate page exit if element exists
      if (pageRef.current) {
        await gsapUtils.fadeOut(pageRef.current)
      }
      router.push("/dashboard")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Invalid credentials. Please try again."

      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    if (showPassword && eyeIconRef.current) {
      gsap.to(eyeIconRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (eyeIconRef.current) {
            gsap.to(eyeIconRef.current, {
              scale: 1,
              opacity: 1,
              duration: 0.3
            })
          }
        }
      })
    } else if (eyeOffIconRef.current) {
      gsap.to(eyeOffIconRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (eyeOffIconRef.current) {
            gsap.to(eyeOffIconRef.current, {
              scale: 1,
              opacity: 1,
              duration: 0.3
            })
          }
        }
      })
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

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">

      <div ref={backLinkRef} className="absolute top-6 left-6 opacity-0">
        <Link
          href="/welcome"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
          onMouseEnter={() => arrowRef.current && gsap.to(arrowRef.current, { x: -4, duration: 0.2 })}
          onMouseLeave={() => arrowRef.current && gsap.to(arrowRef.current, { x: 0, duration: 0.2 })}
        >
          <ArrowLeft ref={arrowRef} className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div ref={brandHeaderRef} className="text-center mb-8 opacity-0">
          <div ref={logoRef} className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back to Climdo
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to continue your productivity journey
          </p>
        </div>

        <div ref={cardRef} className="opacity-0">
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your credentials to access your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  ref={el => { if (el) formItemsRef.current[0] = el }}
                  className="space-y-2 opacity-0"
                >
                  <Label htmlFor="username" className="text-gray-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange("username")}
                    className={`h-12 transition-all duration-200 ${errors.username ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                  />
                  {errors.username && (
                    <div className="text-red-500 text-sm">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div
                  ref={el => { if (el) formItemsRef.current[1] = el }}
                  className="space-y-2 opacity-0"
                >
                  <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      className={`h-12 pr-10 transition-all duration-200 ${errors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => gsap.to(showPassword ? eyeOffIconRef.current : eyeIconRef.current, { scale: 1.1, duration: 0.2 })}
                      onMouseLeave={() => gsap.to(showPassword ? eyeOffIconRef.current : eyeIconRef.current, { scale: 1, duration: 0.2 })}
                    >
                      {showPassword ? (
                        <EyeOff ref={eyeOffIconRef} className="h-4 w-4" />
                      ) : (
                        <Eye ref={eyeIconRef} className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="text-red-500 text-sm">
                      {errors.password}
                    </div>
                  )}
                </div>


                <Button
                  ref={submitButtonRef}
                  type="submit"
                  disabled={isLoadingL}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-medium"
                  onMouseDown={(e) => gsapUtils.buttonPress(e.currentTarget)}
                  onMouseUp={(e) => gsapUtils.buttonRelease(e.currentTarget)}
                  onMouseLeave={(e) => gsapUtils.buttonRelease(e.currentTarget)}
                >
                  {isLoadingL ? "Signing in..." : "Sign In"}
                </Button>

              </form>

              <div ref={footerLinksRef} className="space-y-4 opacity-0">
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
                  >
                    Create one now
                  </Link>
                </div>
                <div className="text-center text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}