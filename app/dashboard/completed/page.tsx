"use client"

import { useEffect, useState, useRef } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { useApi } from "@/hooks/use-api"
import type { Task } from "@/types"
import { CheckCircle, Trophy, Star, Target, TrendingUp, AlertCircle, RefreshCw, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"

export default function CompletedPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { get } = useApi()

  // Refs for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const achievementRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const tasksGridRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const trophyRef = useRef<HTMLDivElement>(null)

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await get("/api/task/")
      setTasks(response)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      if (errorMessage.includes("Backend server") || errorMessage.includes("Cannot connect")) {


        setError(errorMessage)
      }
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

      // Animate achievement banner
      if (achievementRef.current && completedTasks.length > 0) {
        gsapUtils.fadeIn(achievementRef.current, 0.3)

        // Animate trophy icon
        if (trophyRef.current) {
          setTimeout(() => {
            if (trophyRef.current) {
              gsapUtils.iconHover(trophyRef.current)
            }
          }, 800)
        }
      }

      // Animate stats
      if (statsRef.current) {
        const statCards = Array.from(statsRef.current.querySelectorAll<HTMLElement>(".stat-card"));
        gsapUtils.staggerIn(statCards, 0.4);
      }

      // Animate tasks grid or empty state
      if (completedTasks.length === 0 && emptyStateRef.current) {
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
      } else if (tasksGridRef.current) {
        const taskCards = Array.from(tasksGridRef.current.querySelectorAll<HTMLElement>(".task-card"));
        gsapUtils.staggerIn(taskCards, 0.6);
      }
    }
  }, [isLoading, error, tasks])

  const completedTasks = tasks.filter((task) => task.is_completed && !task.is_deleted)

  // Group tasks by completion period
  const getTasksByPeriod = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      today: completedTasks.filter((task) => {
        if (!task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        return completedDate >= today
      }),
      thisWeek: completedTasks.filter((task) => {
        if (!task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        return completedDate >= thisWeek && completedDate < today
      }),
      thisMonth: completedTasks.filter((task) => {
        if (!task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        return completedDate >= thisMonth && completedDate < thisWeek
      }),
      older: completedTasks.filter((task) => {
        if (!task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        return completedDate < thisMonth
      }),
    }
  }

  const taskPeriods = getTasksByPeriod()

  const handleRetry = () => {
    fetchTasks()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading completed tasks...</p>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      icon: CheckCircle,
      label: "Total Completed",
      value: completedTasks.length,
      color: "green",
    },
    {
      icon: Target,
      label: "This Week",
      value: taskPeriods.today.length + taskPeriods.thisWeek.length,
      color: "blue",
    },
    {
      icon: TrendingUp,
      label: "Productivity",
      value: completedTasks.length > 0 ? Math.min(100, completedTasks.length * 10) : 0,
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
            <Trophy className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Completed Tasks</h1>
        </div>
        <p className="text-gray-600 text-sm">Celebrate your achievements and track your progress</p>
      </div>

      {/* Achievement Banner */}
      {completedTasks.length > 0 && (
        <div ref={achievementRef} className="opacity-0">
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-center text-center">
              <div
                ref={trophyRef}
                className="cursor-pointer mr-4"
                onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
              >
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-700 mb-1">
                  🎉 Congratulations! You've completed <GSAPCounter value={completedTasks.length} /> tasks!
                </h2>
                <p className="text-green-600">Keep up the excellent work and maintain your productivity streak!</p>
              </div>
              <div className="ml-4 flex space-x-1">
                {[...Array(Math.min(5, Math.floor(completedTasks.length / 2)))].map((_, i) => (
                  <div
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                    onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                  >
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                  {stat.suffix}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks Grid or Empty State */}
      {completedTasks.length === 0 ? (
        <div ref={emptyStateRef} className="text-center py-16 opacity-0">
          <div
            ref={iconRef}
            className="opacity-0 cursor-pointer inline-block"
            onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
            onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
          >
            <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          </div>
          <div className="text-gray-500 text-lg mb-2">No completed tasks yet</div>
          <p className="text-gray-400 text-sm">

            Complete some tasks to see your achievements here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Today */}
          {taskPeriods.today.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="cursor-pointer mr-2"
                  onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                  onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Completed Today</h2>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={taskPeriods.today.length} />
                </span>
              </div>
              <div ref={tasksGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskPeriods.today.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={() => fetchTasks()}
                    isDemo={false}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Week */}
          {taskPeriods.thisWeek.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="cursor-pointer mr-2"
                  onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                  onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">This Week</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={taskPeriods.thisWeek.length} />
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskPeriods.thisWeek.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={() => fetchTasks()}
                    isDemo={false}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Month */}
          {taskPeriods.thisMonth.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="cursor-pointer mr-2"
                  onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                  onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                >
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">This Month</h2>
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={taskPeriods.thisMonth.length} />
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskPeriods.thisMonth.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={() => fetchTasks()}
                    isDemo={false}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {taskPeriods.older.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="cursor-pointer mr-2"
                  onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                  onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
                >
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Earlier</h2>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  <GSAPCounter value={taskPeriods.older.length} />
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskPeriods.older.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={() => fetchTasks()}
                    isDemo={false}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
