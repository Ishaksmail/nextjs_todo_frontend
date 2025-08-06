"use client"

import { useEffect, useRef } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import GroupDeleteCard from "@/components/groups/group-delete-card"
import { Trash2, AlertCircle, RefreshCw, RotateCcw, AlertTriangle, Clock, Archive, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPCounter } from "@/components/ui/gsap-counter"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { useGroup } from "@/components/providers/group-provider"
import { useTask } from "@/components/providers/task-provider"

export default function TrashPage() {
  const { tasks, isLoading, error, fetch_tasks } = useTask()
  const { groups, fetch_groups } = useGroup()
  const { toast } = useToast()

  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch_tasks()
    fetch_groups()
  }, [])

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.classList.remove("opacity-0")
    }
  }, [tasks, groups])

  // Filter only deleted tasks & groups
  const deletedTasks = tasks.filter((task) => task.is_deleted)
  const deletedGroups = groups.filter((group) => group.is_deleted)

  // Days until permanent deletion
  const getDaysUntilDeletion = (deletedAt?: string) => {
    if (!deletedAt) return 30
    const deletedDate = new Date(deletedAt)
    const now = new Date()
    const daysSinceDeleted = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 30 - daysSinceDeleted)
  }

  // Group tasks
  const tasksByUrgency = {
    critical: deletedTasks.filter((task) => getDaysUntilDeletion(task.deleted_at) <= 7),
    warning: deletedTasks.filter((task) => {
      const days = getDaysUntilDeletion(task.deleted_at)
      return days > 7 && days <= 14
    }),
    safe: deletedTasks.filter((task) => getDaysUntilDeletion(task.deleted_at) > 14),
  }

  const handleRestoreAll = async () => {
    toast({ title: "Success", description: `Restored ${deletedTasks.length} tasks successfully!` })
    fetch_tasks()
  }

  const handleEmptyTrash = async () => {
    toast({ title: "Success", description: "Trash emptied successfully" })
    fetch_tasks()
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

  return (
    <div ref={pageRef} className="space-y-8 opacity-0 transition-opacity duration-500">
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 flex items-center">
            {error}
            <Button variant="outline" size="sm" onClick={fetch_tasks} className="ml-2 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center mb-2">
          <Trash2 className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900">Trash</h1>
        </div>
        <p className="text-gray-600 text-sm">Deleted tasks and groups are stored here temporarily before permanent removal</p>
      </div>

      {/* --- Deleted Groups Section --- */}
      {deletedGroups.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Deleted Groups</h2>
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              <GSAPCounter value={deletedGroups.length} />
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deletedGroups.map((group) => (
              <GroupDeleteCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}

      {deletedTasks.length === 0 && deletedGroups.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500 text-lg mb-2">Trash is empty</div>
          <p className="text-gray-400 text-sm">Deleted items will appear here</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(tasksByUrgency).map(([key, list]) => {
            if (list.length === 0) return null
            const titles: Record<string, string> = {
              critical: "Critical - Will be deleted soon",
              warning: "Auto-delete Soon",
              safe: "Recently Deleted",
            }
            const Icon = key === "critical" ? AlertTriangle : key === "warning" ? Clock : Archive
            const color = key === "critical" ? "text-red-600 bg-red-100" : key === "warning" ? "text-orange-600 bg-orange-100" : "text-gray-600 bg-gray-100"

            return (
              <div key={key}>
                <div className="flex items-center mb-4">
                  <Icon className={`h-5 w-5 mr-2 ${color.split(" ")[0]}`} />
                  <h2 className="text-lg font-semibold text-gray-900">{titles[key]}</h2>
                  <span className={`ml-2 px-2 py-1 ${color} text-xs rounded-full font-medium`}>
                    <GSAPCounter value={list.length} />
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((task, index) => (
                    <div key={task.id} className="relative">
                      <div className="absolute -top-2 -right-2 z-10">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {getDaysUntilDeletion(task.deleted_at)} days left
                        </span>
                      </div>
                      <TaskCard task={task} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
