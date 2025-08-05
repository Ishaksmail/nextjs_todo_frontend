"use client"

import { useEffect, useState, useRef } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { useApi } from "@/hooks/use-api"
import type { Group, Task } from "@/types"
import { FolderOpen, Users, AlertCircle, RefreshCw, ChevronDown, ChevronRight, Trophy, Star, CheckCircle, Calendar, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"
import GroupCard from "@/components/groups/GroupCard"


export default function EnhancedGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([1, 2, 3]))
  const { get } = useApi()

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const groupsRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const folderIconRef = useRef<HTMLDivElement>(null)

  const fetchGroups = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await get("/api/group/")
      setGroups(response)
    } catch (error) {
      console.error("Failed to fetch groups:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)

    } finally {
      setIsLoading(false)
    }
  }

  // useEffect(() => {
  //   fetchGroups()
  // }, [])

  // GSAP animations after content loads
  useEffect(() => {
    if (!isLoading) {
      // Animate page entrance
      if (pageRef.current) {
        gsapUtils.pageEnter(pageRef.current)
      }

      // Animate header
      if (headerRef.current) {
        gsapUtils.fadeIn(headerRef.current, 0.1)
      }

      // Animate folder icon
      if (folderIconRef.current) {
        setTimeout(() => {
          if (folderIconRef.current) {
            gsapUtils.iconHover(folderIconRef.current)
          }
        }, 800)
      }

      // Animate alert if present
      if (error && alertRef.current) {
        gsapUtils.fadeIn(alertRef.current, 0.2)
      }

      // Animate stats if groups have tasks
      if (statsRef.current && groups.some(g => g.tasks && g.tasks.length > 0)) {
        const statCards = Array.from(statsRef.current.querySelectorAll<HTMLElement>(".stat-card"))
        gsapUtils.staggerIn(statCards, 0.3)
      }

      // Animate groups or empty state
      if (groups.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.6)
      } else if (groupsRef.current) {
        const groupCards = Array.from(groupsRef.current.querySelectorAll<HTMLElement>(".group-card"))
        gsapUtils.staggerIn(groupCards, 0.4)
      }
    }
  }, [isLoading, error, groups])

  const toggleGroup = (groupId: number) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const handleRetry = () => {
    fetchGroups()
  }

  // Calculate statistics
  const calculateStats = () => {
    let totalTasks = 0
    let completedTasks = 0
    let groupsWithTasks = 0

    groups.forEach(group => {
      if (group.tasks && group.tasks.length > 0) {
        groupsWithTasks++
        totalTasks += group.tasks.length
        completedTasks += group.tasks.filter(task => task.is_completed).length
      }
    })

    return {
      totalGroups: groups.length,
      groupsWithTasks,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  }

  const stats = calculateStats()

  const statsData = [
    {
      icon: FolderOpen,
      label: "Total Groups",
      value: stats.totalGroups,
      color: "blue",
    },
    {
      icon: CheckCircle,
      label: "Completed Tasks",
      value: stats.completedTasks,
      color: "green",
    },
    {
      icon: TrendingUp,
      label: "Completion Rate",
      value: stats.completionRate,
      color: "purple",
      suffix: "%",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading your groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-8 opacity-0">
      {/* Error Alert */}
      {error && (
        <div ref={alertRef} className="opacity-0">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4  text-red-600" />
            <AlertDescription className="text-red-800">
              {error}

              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>

            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Page Header */}
      <div ref={headerRef} className="mb-6 opacity-0">
        <div className="flex items-center mb-2">
          <div
            ref={folderIconRef}
            className="mr-2 cursor-pointer"
            onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
          >
            <FolderOpen className="h-6 w-6 text-blue-600 " />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Groups</h1>
        </div>
        <p className="text-gray-600 text-sm">Organize your tasks and track progress efficiently</p>
      </div>


      {/* Groups List */}
      {groups.length === 0 ? (
        <div ref={emptyStateRef} className="text-center py-16 opacity-0">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-400 text-xl mb-2">No groups yet</div>
          <p className="text-gray-500">

            Create your first group to get started
          </p>
        </div>
      ) : (
        <div ref={groupsRef} className="space-y-6">
          {groups.map((group, index) => {
            const isExpanded = expandedGroups.has(group.id!)
            const activeTasks = group.tasks?.filter((task) => !task.is_completed && !task.is_deleted) || []
            const completedTasks = group.tasks?.filter((task) => task.is_completed && !task.is_deleted) || []
            const totalTasks = activeTasks.length + completedTasks.length
            const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

            return (
              <GroupCard
                key={group.id}
                group={group}
                onUpdate={fetchGroups}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}