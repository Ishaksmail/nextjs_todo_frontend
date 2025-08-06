"use client"

import { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import type { Task } from "@/types"
import { CalendarDays, AlertCircle, RefreshCw, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"
import { useTask } from "@/components/providers/task-provider"

export default function UpcomingPage() {
  const { tasks, isLoading, error, fetch_tasks } = useTask()
  const [statsInitialized, setStatsInitialized] = useState(false)

  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const tasksGridRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  // حساب المهام حسب الفترات الزمنية
  const { thisWeekTasks, nextWeekTasks, laterTasks } = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfThisWeek = new Date(today)
    endOfThisWeek.setDate(today.getDate() + (7 - today.getDay()))
    endOfThisWeek.setHours(23, 59, 59, 999)

    const endOfNextWeek = new Date(endOfThisWeek)
    endOfNextWeek.setDate(endOfThisWeek.getDate() + 7)

    const upcomingTasks = tasks
      .filter(task => !task.is_completed && !task.is_deleted && task.due_at && new Date(task.due_at) > now)
      .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())

    return {
      thisWeekTasks: upcomingTasks.filter(task => new Date(task.due_at!) <= endOfThisWeek),
      nextWeekTasks: upcomingTasks.filter(task => new Date(task.due_at!) > endOfThisWeek && new Date(task.due_at!) <= endOfNextWeek),
      laterTasks: upcomingTasks.filter(task => new Date(task.due_at!) > endOfNextWeek),
    }
  }, [tasks])

  const fetchTasks = useCallback(async () => {
    try {
      await fetch_tasks()
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  }, [fetch_tasks])

  // تشغيل الأنيميشن مرة واحدة
  useEffect(() => {
    if (!isLoading && !statsInitialized && !error) {
      if (statsRef.current) {
        const statCards = statsRef.current.querySelectorAll('.stat-card')
        gsapUtils.staggerIn(Array.from(statCards) as HTMLElement[], 0.3)
        setStatsInitialized(true)
      }
      if (pageRef.current) gsapUtils.pageEnter(pageRef.current)
      if (headerRef.current) gsapUtils.fadeIn(headerRef.current, 0.1)
    }
  }, [isLoading, statsInitialized, error])

  // إظهار رسالة الخطأ
  useEffect(() => {
    if (error && alertRef.current) {
      gsapUtils.fadeIn(alertRef.current, 0.2)
    }
  }, [error])

  // أنيميشن للمهام
  useEffect(() => {
    if (!isLoading && !error) {
      if (thisWeekTasks.length === 0 && nextWeekTasks.length === 0 && laterTasks.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.1)
        if (iconRef.current) {
          gsapUtils.fadeIn(iconRef.current, 0.1)
          setTimeout(() => gsapUtils.iconHover(iconRef.current!), 200)
        }
      } else if (tasksGridRef.current) {
        const taskCards = tasksGridRef.current.querySelectorAll('.task-card')
        gsapUtils.staggerIn(Array.from(taskCards) as HTMLElement[], 0.1)
      }
    }
  }, [isLoading, thisWeekTasks, nextWeekTasks, laterTasks, error])

  const statsData = useMemo(() => [
    {
      icon: CalendarDays,
      label: "Upcoming Tasks",
      value: thisWeekTasks.length + nextWeekTasks.length + laterTasks.length,
      color: "blue",
    },
    {
      icon: Clock,
      label: "This Week",
      value: thisWeekTasks.length,
      color: "orange",
    },
    {
      icon: Calendar,
      label: "Next Week",
      value: nextWeekTasks.length,
      color: "purple",
    },
  ], [thisWeekTasks, nextWeekTasks, laterTasks])

  const hasTasks = thisWeekTasks.length > 0 || nextWeekTasks.length > 0 || laterTasks.length > 0

  return (
    <div ref={pageRef} className="space-y-6 opacity-0">
      {/* رسالة الخطأ */}
      {error && (
        <div ref={alertRef} className="opacity-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center">
              {typeof error === 'string' ? error : 'An unexpected error occurred'}
              <Button variant="ghost" size="sm" onClick={fetchTasks} className="ml-2 hover:bg-transparent">
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* العنوان */}
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

      {/* الإحصائيات */}
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

      {/* عرض المهام */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 text-sm">{error ? 'Retrying...' : 'Loading your tasks...'}</p>
          </div>
        </div>
      ) : (
        <>
          {!hasTasks ? (
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
              <p className="text-gray-400 text-sm">Tasks with due dates will appear here</p>
            </div>
          ) : (
            <div ref={tasksGridRef} className="space-y-6">
              {thisWeekTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 text-orange-600 mr-2" /> This Week
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {thisWeekTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </div>
                </div>
              )}
              {nextWeekTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" /> Next Week
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nextWeekTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </div>
                </div>
              )}
              {laterTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <CalendarDays className="h-5 w-5 text-gray-600 mr-2" /> Later
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {laterTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
