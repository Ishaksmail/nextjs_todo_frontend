"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import type { Task } from "@/types"
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"
import { useTask } from "@/components/providers/task-provider"

export default function DashboardPage() {
  const { tasks, isLoading, error, fetch_tasks } = useTask();
  const [statsInitialized, setStatsInitialized] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const tasksGridRef = useRef<HTMLDivElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Memoized task filters to prevent unnecessary recalculations
  const { todayTasks, completedToday, noDateTasks } = useMemo(() => {
    const today = new Date().toDateString();

    return {
      todayTasks: tasks.filter((task) => {
        const dueDate = task.due_at ? new Date(task.due_at).toDateString() : "";
        return (dueDate === today) && !task.is_completed && !task.is_deleted;
      }),
      completedToday: tasks.filter((task) => {
        const completedDate = task.completed_at ? new Date(task.completed_at).toDateString() : "";
        return completedDate === today && task.is_completed && !task.is_deleted;
      }),
      noDateTasks: tasks.filter((task) => {
        return !task.due_at && !task.is_completed && !task.is_deleted;
      })
    };
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    try {
      await fetch_tasks();
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [fetch_tasks]);


  // Initialize animations only once for stats
  useEffect(() => {
    if (!isLoading && !statsInitialized && !error) {
      if (statsRef.current) {
        const statCards = statsRef.current.querySelectorAll('.stat-card');
        gsapUtils.staggerIn(Array.from(statCards) as HTMLElement[], 0.3);
        setStatsInitialized(true);
      }
      if (pageRef.current) {
        gsapUtils.pageEnter(pageRef.current);
      }
      if (headerRef.current) {
        gsapUtils.fadeIn(headerRef.current, 0.1);
      }
    }
  }, [isLoading, statsInitialized, error]);

  // Error animation handling
  useEffect(() => {
    if (error && alertRef.current) {
      gsapUtils.fadeIn(alertRef.current, 0.2);
    }
  }, [error]);

  // Tasks grid animations
  useEffect(() => {
    if (!isLoading && !error) {
      if (todayTasks.length === 0 && noDateTasks.length === 0 && completedToday.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.1);

        if (iconRef.current) {
          gsapUtils.fadeIn(iconRef.current, 0.1);
          setTimeout(() => {
            if (iconRef.current) {
              gsapUtils.iconHover(iconRef.current);
            }
          });
        }
      } else if (tasksGridRef.current) {
        const taskCards = tasksGridRef.current.querySelectorAll('.task-card');
        gsapUtils.staggerIn(Array.from(taskCards) as HTMLElement[], 0.1);
      }
    }
  }, [isLoading, todayTasks, noDateTasks, completedToday, error]);

  const handleRetry = useCallback(() => {
   
      fetchTasks();
    
  }, [fetchTasks]);

  const statsData = useMemo(() => [
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
  ], [todayTasks, completedToday]);

  const hasTasks = todayTasks.length > 0 || noDateTasks.length > 0 || completedToday.length > 0;

  return (
    <div ref={pageRef} className="space-y-6 opacity-0">
      {/* Error Alert */}
      {error && (
        <div ref={alertRef} className="opacity-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center">
              {typeof error === 'string' ? error : 'An unexpected error occurred'}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="ml-2 hover:bg-transparent"
              >
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

      {/* Stats - Only loaded once and not re-animated */}
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 text-sm">
              {error ? 'Retrying...' : 'Loading your tasks...'}
            </p>
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
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              </div>
              <div className="text-gray-500 text-lg mb-2">No tasks for today</div>
              <p className="text-gray-400 text-sm">
                Click the + button to add your first task
              </p>
            </div>
          ) : (
            <div ref={tasksGridRef} className="space-y-6">
              {/* Today's Tasks Section */}
              {todayTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">Due Today</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* No Date Tasks Section */}
              {noDateTasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">No Due Date</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {noDateTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Today Section */}
              {completedToday.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">Completed Today</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedToday.map((task, index) => (
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
  );
}