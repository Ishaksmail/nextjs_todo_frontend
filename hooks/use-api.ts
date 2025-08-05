"use client"

import { useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

export function useApi() {
  const handleError = useCallback((error: any, customMessage?: string) => {
    console.error("API Error:", error)

    if (error.code === "ECONNABORTED") {
      toast({
        title: "Request Timeout",
        description: "The request took too long. Please try again.",
        variant: "destructive",
      })
    } else if (error.response?.status === 404) {
      toast({
        title: "Not Found",
        description: customMessage || "The requested resource was not found.",
        variant: "destructive",
      })
    } else if (error.response?.status === 403) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      })
    } else if (!error.response) {
      // Network error - use mock data
      throw new Error("Backend server is not available")
    } else {
      toast({
        title: "Error",
        description: customMessage || error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    }

    throw error
  }, [])

  const get = useCallback(
    async (url: string) => {
      try {
        return await apiClient.get(url)
      } catch (error) {
        handleError(error)
      }
    },
    [handleError],
  )

  const post = useCallback(
    async (url: string, data: any) => {
      try {
        return await apiClient.post(url, data)
      } catch (error) {
        handleError(error)
      }
    },
    [handleError],
  )

  const patch = useCallback(
    async (url: string, data: any) => {
      try {
        return await apiClient.patch(url, data)
      } catch (error) {
        handleError(error)
      }
    },
    [handleError],
  )

  const put = useCallback(
    async (url: string, data: any) => {
      try {
        return await apiClient.put(url, data)
      } catch (error) {
        handleError(error)
      }
    },
    [handleError],
  )

  const del = useCallback(
    async (url: string) => {
      try {
        return await apiClient.delete(url)
      } catch (error) {
        handleError(error)
      }
    },
    [handleError],
  )

  return { get, post, patch, put, del }
}
