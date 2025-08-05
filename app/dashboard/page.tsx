"use client"

import { useEffect, useState, useRef } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { useApi } from "@/hooks/use-api"
import type { Task } from "@/types"
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"


export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { get } = useApi()

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const tasksGridRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await get("/api/task/")
      const today = new Date().toDateString()
      const filteredTasks = response.filter((task: Task) => {
        const dueDate = task.due_at ? new Date(task.due_at).toDateString() : ""
        return (dueDate === today) && !task.is_completed && !task.is_deleted
      })
      
      setTasks(filteredTasks)
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

      // Animate stats
      if (statsRef.current) {
        const statCards = statsRef.current.querySelectorAll('.stat-card');
        gsapUtils.staggerIn(Array.from(statCards) as HTMLElement[], 0.3);
      }

      // Animate tasks grid or empty state
      if (todayTasks.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.5)

        // Animate floating icon
        if (iconRef.current) {
          gsapUtils.fadeIn(iconRef.current, 0.6)
          // Add floating animation
          setTimeout(() => {
            if (iconRef.current) {
              gsapUtils.iconHover(iconRef.current)
            }
          }, 1000)
        }
      } else if (tasksGridRef.current) {

        const taskCards = tasksGridRef.current.querySelectorAll('.task-card');
        gsapUtils.staggerIn(Array.from(taskCards) as HTMLElement[], 0.5);
      }
    }
  }, [isLoading, error, tasks])

  const todayTasks = tasks.filter((task) => {
    const today = new Date().toDateString()
    const taskDate = task.created_at ? new Date(task.created_at).toDateString() : ""
    const dueDate = task.due_at ? new Date(task.due_at).toDateString() : ""
    return (taskDate === today || dueDate === today) && !task.is_completed && !task.is_deleted
  })

  const completedToday = tasks.filter((task) => {
    const today = new Date().toDateString()
    const completedDate = task.completed_at ? new Date(task.completed_at).toDateString() : ""
    return completedDate === today && task.is_completed && !task.is_deleted
  })

  const handleRetry = () => {
    fetchTasks()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      icon: Clock,
      label: "Today's Tasks",
      value: todayTasks.length,
      color: "blue",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: completedToday.length,
      color: "green",
    },
    {
      icon: Calendar,
      label: "Progress",
      value:
        todayTasks.length + completedToday.length > 0
          ? Math.round((completedToday.length / (todayTasks.length + completedToday.length)) * 100)
          : 0,
      color: "purple",
      suffix: "%",
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
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Today</h1>
        </div>
        <p className="text-gray-600 text-sm">Focus on what matters most today</p>
      </div>

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
                  {stat.suffix}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks Grid or Empty State */}
      {todayTasks.length === 0 ? (
        <div ref={emptyStateRef} className="text-center py-16 opacity-0">
          <div
            ref={iconRef}
            className="opacity-0 cursor-pointer inline-block"
            onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
          >
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          </div>
          <div className="text-gray-500 text-lg mb-2">No tasks for today</div>
          <p className="text-gray-400 text-sm">
            Click the + button to add your first task
          </p>
        </div>
      ) : (
        <div ref={tasksGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={() => fetchTasks()}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
