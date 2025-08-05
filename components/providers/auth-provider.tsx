"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types"
import { apiClient } from "@/lib/api-client"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {

        const userData = await apiClient.get("/api/user/isLogin")
        setUser(userData)
       
      } catch (error) {
        console.error("Auth check failed:", error)

      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", { username, password })

      setUser(response.user || { username })

    } catch (error) {

      if (error instanceof Error && error.message.includes("Backend server")) {
        console.warn("Backend not available, using demo login")
        setUser({ username })
        return
      }
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      await apiClient.post("/auth/register", { username, email, password })
    } catch (error) {
      if (error instanceof Error && error.message.includes("Backend server")) {
        console.warn("Backend not available, using demo registration")
        return
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.warn("Backend not available for logout")
    }

    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}
