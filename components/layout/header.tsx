"use client"

import { Search, Bell, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "../ui/sidebar"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/welcome")
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks, groups..."
              className="pl-10 h-9 border-gray-200 focus:border-blue-300 focus:ring-blue-100 bg-gray-50/50 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-50 rounded-lg">
            <Bell className="h-4 w-4 text-gray-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 h-9 px-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-lg border-gray-100 bg-gray-50">
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="text-sm">
                <User className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
