"use client"

import { useEffect, useState, useRef } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { useApi } from "@/hooks/use-api"
import type { Task } from "@/types"
import { Trash2, AlertCircle, RefreshCw, RotateCcw, AlertTriangle, Clock, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"
import { useToast } from "@/hooks/use-toast"

export default function TrashPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { get, patch } = useApi()
  const { toast } = useToast()

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const warningRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const tasksGridRefs = useRef<(HTMLDivElement | null)[]>([])
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await get("/api/task/")
      setTasks(response)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      setError(errorMessage)

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

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

      // Animate alert if present
      if (error && alertRef.current) {
        gsapUtils.fadeIn(alertRef.current, 0.2)
      }

      // Animate warning banner
      if (warningRef.current && deletedTasks.length > 0) {
        gsapUtils.fadeIn(warningRef.current, 0.3)
      }

      // Animate stats

      if (statsRef.current) {
        const statCards = Array.from(statsRef.current.querySelectorAll(".stat-card")) as HTMLElement[]
        gsapUtils.staggerIn(statCards, 0.4)
      }

      // Animate action buttons
      if (actionsRef.current && deletedTasks.length > 0) {
        gsapUtils.fadeIn(actionsRef.current, 0.5)
      }

      // Animate tasks grid or empty state
      if (deletedTasks.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.6)

        // Animate floating icon
        if (iconRef.current) {
          gsapUtils.fadeIn(iconRef.current, 0.7)
          setTimeout(() => {
            if (iconRef.current) {
              gsapUtils.iconHover(iconRef.current)
            }
          }, 1200)
        }
      } if (tasksGridRefs.current.length > 0) {
        tasksGridRefs.current.forEach((grid) => {
          if (grid) {
            const taskCards = Array.from(grid.querySelectorAll(".task-card")) as HTMLElement[]
            gsapUtils.staggerIn(taskCards, 0.6)
          }
        })
      }
    }
  }, [isLoading, error, tasks])

  const deletedTasks = tasks.filter((task) => task.is_deleted)

  // Calculate days until permanent deletion (assuming 30-day retention)
  const getDaysUntilDeletion = (deletedAt?: string) => {
    if (!deletedAt) return 30
    const deletedDate = new Date(deletedAt)
    const now = new Date()
    const daysSinceDeleted = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 30 - daysSinceDeleted)
  }

  // Group tasks by urgency
  const getTasksByUrgency = () => {
    return {
      critical: deletedTasks.filter((task) => getDaysUntilDeletion(task.deleted_at) <= 7),
      warning: deletedTasks.filter((task) => {
        const days = getDaysUntilDeletion(task.deleted_at)
        return days > 7 && days <= 14
      }),
      safe: deletedTasks.filter((task) => getDaysUntilDeletion(task.deleted_at) > 14),
    }
  }

  const tasksByUrgency = getTasksByUrgency()

  const handleRestoreAll = async () => {

    try {
      // Restore all deleted tasks
      await Promise.all(deletedTasks.map((task) => patch(`/api/task/restore/${task.id}`, {})))
      toast({
        title: "Success",
        description: `Restored ${deletedTasks.length} tasks successfully!`,
      })
      fetchTasks()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore tasks",
        variant: "destructive",
      })
    }
  }

  const handleEmptyTrash = async () => {

    try {
      // Permanently delete all tasks
      await Promise.all(deletedTasks.map((task) => patch(`/api/task/permanent-delete/${task.id}`, {})))
      toast({
        title: "Success",
        description: "Trash emptied successfully",
      })
      fetchTasks()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to empty trash",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    fetchTasks()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading trash...</p>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      icon: Trash2,
      label: "Deleted Tasks",
      value: deletedTasks.length,
      color: "red",
    },
    {
      icon: AlertTriangle,
      label: "Critical (≤7 days)",
      value: tasksByUrgency.critical.length,
      color: "red",
    },
    {
      icon: Clock,
      label: "Auto-delete Soon",
      value: tasksByUrgency.warning.length,
      color: "orange",
    },
  ]

  return (
    <div ref={pageRef} className="space-y-6 opacity-0">
      {/* Error Alert */}
      {error && (
        <div ref={alertRef} className="opacity-0">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
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
            className="mr-2 cursor-pointer"
            onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
          >
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Trash</h1>
        </div>
        <p className="text-gray-600 text-sm">Deleted tasks are stored here temporarily before permanent removal</p>
      </div>

      {/* Warning Banner */}
      {deletedTasks.length > 0 && (
        <div ref={warningRef} className="opacity-0">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <span className="font-medium">
                <GSAPCounter value={deletedTasks.length} /> deleted tasks
              </span>{" "}
              - These will be permanently removed after 30 days. Critical tasks (≤7 days) are highlighted below.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={stat.label}
            className="stat-card bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 opacity-0 cursor-pointer"
            onMouseEnter={(e) => gsapUtils.cardHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.cardHoverOut(e.currentTarget as HTMLElement)}
          >
            <div className="flex items-center">
              <div
                className={`p-2 bg-${stat.color}-50 rounded-lg cursor-pointer`}
                onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
              >
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900">
                  <GSAPCounter value={stat.value} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {deletedTasks.length > 0 && (
        <div ref={actionsRef} className="flex flex-wrap gap-3 mb-6 opacity-0">
          <Button
            onClick={handleRestoreAll}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onMouseEnter={(e) => gsapUtils.cardHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.cardHoverOut(e.currentTarget as HTMLElement)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore All Tasks
          </Button>
          <Button
            onClick={handleEmptyTrash}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onMouseEnter={(e) => gsapUtils.cardHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.cardHoverOut(e.currentTarget as HTMLElement)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Empty Trash
          </Button>
        </div>
      )}

      {/* Tasks Grid or Empty State */}
      {deletedTasks.length === 0 ? (
        <div ref={emptyStateRef} className="text-center py-16 opacity-0">
          <div
            ref={iconRef}
            className="opacity-0 cursor-pointer inline-block"
            onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
          >
            <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          </div>
          <div className="text-gray-500 text-lg mb-2">Trash is empty</div>
          <p className="text-gray-400 text-sm">
            Deleted tasks will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Critical Tasks (≤7 days) */}
          {tasksByUrgency.critical.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="cursor-pointer mr-2"
                  onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                  onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                >
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Critical - Will be deleted soon</h2>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={tasksByUrgency.critical.length} />
                </span>
              </div>
              <div ref={(el) => { if (el) tasksGridRefs.current[0] = el }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasksByUrgency.critical.map((task, index) => (
                  <div key={task.id} className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {getDaysUntilDeletion(task.deleted_at)} days left
                      </span>
                    </div>
                    <TaskCard task={task} onUpdate={() => fetchTasks()} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Tasks (8-14 days) */}
          {tasksByUrgency.warning.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="cursor-pointer mr-2"
                  onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                  onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                >
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Auto-delete Soon</h2>
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={tasksByUrgency.warning.length} />
                </span>
              </div>
              <div ref={(el) => { if (el) tasksGridRefs.current[1] = el }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasksByUrgency.warning.map((task, index) => (
                  <div key={task.id} className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {getDaysUntilDeletion(task.deleted_at)} days left
                      </span>
                    </div>
                    <TaskCard task={task} onUpdate={() => fetchTasks()} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safe Tasks (>14 days) */}
          {tasksByUrgency.safe.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="cursor-pointer mr-2"
                  onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                  onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                >
                  <Archive className="h-5 w-5 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recently Deleted</h2>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={tasksByUrgency.safe.length} />
                </span>
              </div>
              <div ref={(el) => {if(el) tasksGridRefs.current[2] = el}} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasksByUrgency.safe.map((task, index) => (
                  <div key={task.id} className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {getDaysUntilDeletion(task.deleted_at)} days left
                      </span>
                    </div>
                    <TaskCard task={task} onUpdate={() => fetchTasks()} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
