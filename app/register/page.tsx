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
import { Sparkles, ArrowLeft, User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { gsapUtils } from "@/lib/gsap-utils"
import gsap from "gsap"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingL, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { register, user, isLoading } = useAuth()

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
  const benefitsRef = useRef<HTMLDivElement>(null)
  const formItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const eyeIconRef = useRef<SVGSVGElement>(null)
  const eyeOffIconRef = useRef<SVGSVGElement>(null)
  const confirmEyeIconRef = useRef<SVGSVGElement>(null)
  const confirmEyeOffIconRef = useRef<SVGSVGElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const footerLinksRef = useRef<HTMLDivElement>(null)
  const strengthBarsRef = useRef<(HTMLDivElement | null)[]>([])

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

      // Benefits animation
      if (benefitsRef.current) {
        gsap.fromTo(benefitsRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, delay: 0.7 }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (formData.username.length > 50) {
      newErrors.username = "Username must be less than 50 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Valid email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await register(formData.username, formData.email, formData.password)

      toast({
        title: "Account Created!",
        description: "Welcome to Climdo! Please sign in to continue.",
      })

      // Page exit animation before navigation
      if (pageRef.current) {
        await gsapUtils.fadeOut(pageRef.current)
      }
      router.push("/login")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create account. Please try again."

      toast({
        title: "Registration Failed",
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

  const getPasswordStrength = () => {
    const password = formData.password
    let strength = 0

    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    return strength
  }

  const passwordStrength = getPasswordStrength()

  // Animate password strength bars when password changes
  useEffect(() => {
    if (formData.password) {
      strengthBarsRef.current.forEach((bar, index) => {
        if (bar) {
          gsap.to(bar, {
            scaleX: index < passwordStrength ? 1 : 0,
            backgroundColor: index < passwordStrength
              ? passwordStrength <= 2
                ? "#f87171"
                : passwordStrength <= 3
                  ? "#fbbf24"
                  : "#4ade80"
              : "transparent",
            duration: 0.3,
            delay: index * 0.1,
            ease: "power2.out"
          });
        }
      });
    } else {
      strengthBarsRef.current.forEach(bar => {
        if (bar) {
          gsap.to(bar, {
            scaleX: 0,
            duration: 0.2
          });
        }
      });
    }
  }, [formData.password, passwordStrength]);

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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
    if (showConfirmPassword && confirmEyeIconRef.current) {
      gsap.to(confirmEyeIconRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (confirmEyeIconRef.current) {
            gsap.to(confirmEyeIconRef.current, {
              scale: 1,
              opacity: 1,
              duration: 0.3
            })
          }
        }
      })
    } else if (confirmEyeOffIconRef.current) {
      gsap.to(confirmEyeOffIconRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (confirmEyeOffIconRef.current) {
            gsap.to(confirmEyeOffIconRef.current, {
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
      {/* Back to Welcome */}
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
          <div
            ref={logoRef}
            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4"
            onMouseEnter={() => gsap.to(logoRef.current, { scale: 1.1, rotate: 5, duration: 0.3 })}
            onMouseLeave={() => gsap.to(logoRef.current, { scale: 1, rotate: 0, duration: 0.3 })}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join Climdo Today
          </h1>
          <p className="text-gray-600 mt-2">
            Start your productivity journey in minutes
          </p>
        </div>

        <div ref={cardRef} className="opacity-0">
          <Card
            className="shadow-xl border-0 overflow-hidden"
          >
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Get started with your free Climdo account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits */}
              <div ref={benefitsRef} className="bg-blue-50 rounded-lg p-4 space-y-2 opacity-0">
                {["Free forever plan", "No credit card required", "Setup in 2 minutes"].map((benefit, index) => (
                  <div
                    key={benefit}
                    className="flex items-center text-sm text-blue-800 opacity-0"
                    ref={el => {
                      if (el) {
                        gsap.to(el, {
                          opacity: 1,
                          x: 0,
                          duration: 0.3,
                          delay: 0.7 + index * 0.1,
                          ease: "power2.out"
                        })
                      }
                    }}
                    style={{ transform: 'translateX(-10px)' }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                    {benefit}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  ref={el => {
                    if (el) formItemsRef.current[0] = el
                  }}
                  className="space-y-2 opacity-0"
                >
                  <Label htmlFor="username" className="text-gray-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange("username")}
                    className={`h-12 transition-all duration-200 ${errors.username ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      }`}
                  />
                  {errors.username && (
                    <div className="text-red-500 text-sm">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div
                  ref={el => {
                    if (el) formItemsRef.current[1] = el
                  }}
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
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className={`h-12 transition-all duration-200 ${errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      }`}
                  />
                  {errors.email && (
                    <div className="text-red-500 text-sm">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div
                  ref={el => {
                    if (el) formItemsRef.current[2] = el
                  }}
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
                      placeholder="Create a secure password"
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

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            ref={el => { if (el) strengthBarsRef.current[level - 1] = el }}
                            className="h-1 flex-1 rounded-full bg-gray-200 origin-left"
                            style={{ transform: 'scaleX(0)' }}
                          />
                        ))}
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        {passwordStrength <= 2 && "Weak password"}
                        {passwordStrength === 3 && "Good password"}
                        {passwordStrength >= 4 && "Strong password"}
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <div className="text-red-500 text-sm">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div
                  ref={el => {
                    if (el) formItemsRef.current[3] = el
                  }}
                  className="space-y-2 opacity-0"
                >
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange("confirmPassword")}
                      className={`h-12 pr-10 transition-all duration-200 ${errors.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onMouseEnter={() => gsap.to(showConfirmPassword ? confirmEyeOffIconRef.current : confirmEyeIconRef.current, { scale: 1.1, duration: 0.2 })}
                      onMouseLeave={() => gsap.to(showConfirmPassword ? confirmEyeOffIconRef.current : confirmEyeIconRef.current, { scale: 1, duration: 0.2 })}
                    >
                      {showConfirmPassword ? (
                        <EyeOff ref={confirmEyeOffIconRef} className="h-4 w-4" />
                      ) : (
                        <Eye ref={confirmEyeIconRef} className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="text-red-500 text-sm">
                      {errors.confirmPassword}
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
                  {isLoadingL ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <div ref={footerLinksRef} className="text-center text-sm text-gray-600 opacity-0">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
                  onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
                >
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}