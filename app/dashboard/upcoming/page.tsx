"use client"

import { useEffect, useState, useRef } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { useApi } from "@/hooks/use-api"
import type { Task } from "@/types"
import { CalendarDays, AlertCircle, RefreshCw, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"

export default function UpcomingPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { get } = useApi()

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const tasksGridRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  // Filter and sort tasks
  const upcomingTasks = tasks
    .filter((task) => {
      if (task.is_completed || task.is_deleted || !task.due_at) return false
      const dueDate = new Date(task.due_at)
      return dueDate > new Date() // Only future dates
    })
    .sort((a, b) => {
      if (!a.due_at || !b.due_at) return 0
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    })

  const fetchTasks = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await get("/api/task/")
      setTasks(response)
    } catch (err: unknown) {
      console.error("Failed to fetch tasks:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
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
      if (pageRef.current) gsapUtils.pageEnter(pageRef.current)
      if (headerRef.current) gsapUtils.fadeIn(headerRef.current, 0.1)
      if (error && alertRef.current) gsapUtils.fadeIn(alertRef.current, 0.2)

      if (statsRef.current) {
        const statCards = Array.from(statsRef.current.querySelectorAll<HTMLElement>('.stat-card'))
        if (statCards.length > 0) gsapUtils.staggerIn(statCards, 0.3)
      }

      if (upcomingTasks.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.5)
        if (iconRef.current) {
          gsapUtils.fadeIn(iconRef.current, 0.6)
          setTimeout(() => iconRef.current && gsapUtils.iconHover(iconRef.current), 1000)
        }
      }

      tasksGridRefs.forEach(ref => {
        if (ref.current) {
          const taskCards = Array.from(ref.current.querySelectorAll<HTMLElement>('.task-card'))
          if (taskCards.length > 0) gsapUtils.staggerIn(taskCards, 0.5)
        }
      })
    }
  }, [isLoading, error, tasks])

  const getTasksByPeriod = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfThisWeek = new Date(today)
    endOfThisWeek.setDate(today.getDate() + (7 - today.getDay()))
    endOfThisWeek.setHours(23, 59, 59, 999)

    const endOfNextWeek = new Date(endOfThisWeek)
    endOfNextWeek.setDate(endOfThisWeek.getDate() + 7)

    return {
      thisWeek: upcomingTasks.filter(task => task.due_at && new Date(task.due_at) <= endOfThisWeek),
      nextWeek: upcomingTasks.filter(task => task.due_at && new Date(task.due_at) > endOfThisWeek && new Date(task.due_at) <= endOfNextWeek),
      later: upcomingTasks.filter(task => task.due_at && new Date(task.due_at) > endOfNextWeek),
    }
  }

  const taskPeriods = getTasksByPeriod()

  const handleRetry = () => fetchTasks()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading upcoming tasks...</p>
        </div>
      </div>
    )
  }

  const statsData = [
    { icon: CalendarDays, label: "Upcoming Tasks", value: upcomingTasks.length, color: "blue" },
    { icon: Clock, label: "This Week", value: taskPeriods.thisWeek.length, color: "orange" },
    { icon: Calendar, label: "Next Week", value: taskPeriods.nextWeek.length, color: "purple" },
  ]

  return (
    <div ref={pageRef} className="space-y-6 opacity-0">
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
            <CalendarDays className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Upcoming</h1>
        </div>
        <p className="text-gray-600 text-sm">Tasks with upcoming due dates</p>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statsData.map((stat) => (
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

      {/* Tasks Grid or Empty State */}
      {upcomingTasks.length === 0 ? (
        <div ref={emptyStateRef} className="text-center py-16 opacity-0">
          <div
            ref={iconRef}
            className="opacity-0 cursor-pointer inline-block"
            onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
          >
            <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          </div>
          <div className="text-gray-500 text-lg mb-2">No upcoming tasks</div>
          <p className="text-gray-400 text-sm">
            Tasks with due dates will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* This Week */}
          {taskPeriods.thisWeek.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="cursor-pointer mr-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">This Week</h2>
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={taskPeriods.thisWeek.length} />
                </span>
              </div>
              <div ref={tasksGridRefs[0]} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskPeriods.thisWeek.map((task, index) => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchTasks} isDemo={false} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Next Week */}
          {taskPeriods.nextWeek.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 ml-2">Next Week</h2>
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={taskPeriods.nextWeek.length} />
                </span>
              </div>
              <div ref={tasksGridRefs[1]} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskPeriods.nextWeek.map((task, index) => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchTasks} isDemo={false} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Later */}
          {taskPeriods.later.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <CalendarDays className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900 ml-2">Later</h2>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={taskPeriods.later.length} />
                </span>
              </div>
              <div ref={tasksGridRefs[2]} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskPeriods.later.map((task, index) => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchTasks} isDemo={false} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
