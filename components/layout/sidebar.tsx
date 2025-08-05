"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CalendarDays, CheckCircle, Trash2, FolderOpen, Settings, Sparkles } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { gsapUtils } from "@/lib/gsap-utils"

const navigation = [
  { name: "Today", href: "/dashboard", icon: Calendar },
  { name: "Upcoming", href: "/dashboard/upcoming", icon: CalendarDays },
  { name: "Completed", href: "/dashboard/completed", icon: CheckCircle },
  { name: "Groups", href: "/dashboard/groups", icon: FolderOpen },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-100 flex flex-col h-screen transition-all duration-300">

      {/* ===== Header ===== */}
      {/* <SidebarHeader>
        <div className="flex items-center space-x-2">

          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900 transition-all duration-200">
            Climdo
          </span>
        </div>
      </SidebarHeader> */}


      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>

            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="size-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-lg font-semibold text-gray-900 transition-all duration-200">Climdo</span>

                </div>
              </a>
            </SidebarMenuButton>

          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>


      {/* ===== Navigation Menu ===== */}
      <SidebarContent className="flex-1 px-2 py-4">
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                  ${isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                  justify-start`}
                >
                  <Link href={item.href} className="flex items-center"
                    onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget)}
                    onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="ml-3 transition-all duration-200">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ===== Footer Settings ===== */}
      <SidebarFooter className="px-2 py-3 border-t border-gray-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 justify-center md:justify-start"
            >
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="h-5 w-5" />
                <span className="ml-3 transition-all duration-200">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
