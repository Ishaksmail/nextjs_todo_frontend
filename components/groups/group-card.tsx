"use client"

import { useState } from "react"
import type { Group } from "@/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Edit, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface GroupCardProps {
  group: Group
  onUpdate: () => void
  index?: number
}

export function GroupCard({ group, onUpdate, index = 0 }: GroupCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { del } = useApi()
  const { toast } = useToast()

  const handleDelete = async () => {

    setIsDeleting(true)
    try {
      await del(`/api/group/${group.id}`)
      toast({
        title: "Success",
        description: "Group deleted successfully",
      })
      setTimeout(onUpdate, 300)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const taskCount = group.tasks?.length || 0
  const completedCount = group.tasks?.filter((task) => task.is_completed)?.length || 0
  const progressPercentage = taskCount > 0 ? (completedCount / taskCount) * 100 : 0

  return (
    <>
      {!isDeleting && (
        <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 group cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"
              >
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold text-gray-900"

                >
                  {group.name}
                </h3>
                <p
                  className="text-sm text-gray-500 mt-0.5"

                >
                  <AnimatedCounter value={taskCount} className="font-medium" /> tasks
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div

                  className="group-hover:opacity-100 transition-opacity"
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-lg border-gray-100">
                <DropdownMenuItem className="text-sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 text-sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {group.description && (
            <p
              className="text-sm text-gray-600 mb-4 leading-relaxed"

            >
              {group.description}
            </p>
          )}

          {taskCount > 0 && (
            <div
              className="space-y-2"

            >
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  <AnimatedCounter value={completedCount} /> of <AnimatedCounter value={taskCount} /> completed
                </span>
                <span>
                  <AnimatedCounter value={Math.round(progressPercentage)} />%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full"

                />
              </div>
            </div>
          )}

          {group.created_at && (
            <p
              className="text-xs text-gray-400 mt-4"

            >
              Created {new Date(group.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </>
  )
}
