"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { CheckCircle, Trophy, Star, Target, TrendingUp, AlertCircle, RefreshCw, Calendar, Icon, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"
import { useTask } from "@/components/providers/task-provider"
import { Task } from "@/types"

export default function CompletedPage() {
  const { tasks, isLoading, error, fetch_tasks } = useTask()
  const [statsInitialized, setStatsInitialized] = useState(false)

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

  // Filter completed tasks
  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.is_completed && !task.is_deleted)
  }, [tasks])

  // Group tasks by completion period
  const taskPeriods = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      today: completedTasks.filter((task) => task.completed_at && new Date(task.completed_at) >= today),
      thisWeek: completedTasks.filter((task) => task.completed_at && new Date(task.completed_at) >= thisWeek && new Date(task.completed_at) < today),
      thisMonth: completedTasks.filter((task) => task.completed_at && new Date(task.completed_at) >= thisMonth && new Date(task.completed_at) < thisWeek),
      older: completedTasks.filter((task) => task.completed_at && new Date(task.completed_at) < thisMonth),
    }
  }, [completedTasks])

  // Retry fetching
  const handleRetry = () => {
    fetch_tasks()
  }

  // Initialize animations only once
  useEffect(() => {
    if (!isLoading && !statsInitialized) {
      if (statsRef.current) {
        const statCards = statsRef.current.querySelectorAll('.stat-card')
        gsapUtils.staggerIn(Array.from(statCards) as HTMLElement[], 0.3)
        setStatsInitialized(true)
      }
      if (pageRef.current) {
        gsapUtils.pageEnter(pageRef.current)
      }
      if (headerRef.current) {
        gsapUtils.fadeIn(headerRef.current, 0.1)
      }
      if (error && alertRef.current) {
        gsapUtils.fadeIn(alertRef.current, 0.2)
      }
      if (achievementRef.current && completedTasks.length > 0) {
        gsapUtils.fadeIn(achievementRef.current, 0.3)
        if (trophyRef.current) {
          setTimeout(() => gsapUtils.iconHover(trophyRef.current as HTMLElement), 800)
        }
      }
    }
  }, [isLoading, statsInitialized, error, completedTasks])

  // Tasks grid animations
  useEffect(() => {
    if (!isLoading) {
      if (completedTasks.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.1)
        if (iconRef.current) {
          gsapUtils.fadeIn(iconRef.current, 0.1)
          setTimeout(() => gsapUtils.iconHover(iconRef.current as HTMLElement), 1200)
        }
      } else if (tasksGridRef.current) {
        const taskCards = tasksGridRef.current.querySelectorAll('.task-card')
        gsapUtils.staggerIn(Array.from(taskCards) as HTMLElement[], 0.1)
      }
    }
  }, [isLoading, completedTasks])

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
              {typeof error === 'string' ? error : 'An unexpected error occurred'}
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
                  <div key={i} className="cursor-pointer" onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}>
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
          <p className="text-gray-400 text-sm">Complete some tasks to see your achievements here</p>
        </div>
      ) : (
        <div ref={tasksGridRef} className="space-y-8">
          {/* Today */}
          {taskPeriods.today.length > 0 && (
            <Section title="Completed Today" icon={CheckCircle} color="green" count={taskPeriods.today.length} tasks={taskPeriods.today} />
          )}
          {/* This Week */}
          {taskPeriods.thisWeek.length > 0 && (
            <Section title="This Week" icon={Calendar} color="blue" count={taskPeriods.thisWeek.length} tasks={taskPeriods.thisWeek} />
          )}
          {/* This Month */}
          {taskPeriods.thisMonth.length > 0 && (
            <Section title="This Month" icon={Target} color="purple" count={taskPeriods.thisMonth.length} tasks={taskPeriods.thisMonth} />
          )}
          {/* Older */}
          {taskPeriods.older.length > 0 && (
            <Section title="Earlier" icon={TrendingUp} color="gray" count={taskPeriods.older.length} tasks={taskPeriods.older} />
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, icon:Icon, color, count, tasks }:{title:string,icon:LucideIcon,color:string,count:number,tasks:Task[]}) {
  return (
    <div>
      <div className="flex items-center mb-4">
        <Icon className={`h-5 w-5 text-${color}-600 mr-2`} />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className={`ml-2 px-2 py-1 bg-${color}-100 text-${color}-700 text-xs rounded-full font-medium`}>
          <GSAPCounter value={count} />
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  )
}
