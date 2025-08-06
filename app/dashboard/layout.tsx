"use client"

import type React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TaskProvider } from "@/components/providers/task-provider"
import { GroupProvider } from "@/components/providers/group-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()


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
    <div className="min-h-screen bg-gray-50">
      <TaskProvider>
        <GroupProvider>
          <div className="flex">
            <SidebarProvider>
              <AppSidebar />
              <div className="flex-1 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-6 overflow-auto">{children}</main>
              </div>
            </SidebarProvider>
          </div>
          <FloatingActionButton />
        </GroupProvider>
      </TaskProvider>
    </div>
  )
}
