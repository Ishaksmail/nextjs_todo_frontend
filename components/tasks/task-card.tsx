"use client"

import { useState, useRef, useEffect } from "react"
import type { Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Trash2, Calendar, FolderOpen, RotateCcw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { gsapUtils } from "@/lib/gsap-utils"
import { useTask } from "../providers/task-provider"
import { useGroup } from "../providers/group-provider"

interface TaskCardProps {
  task: Task
  index?: number
  compact?: boolean
  className?: string
  showing_in_group?: boolean
}

export function TaskCard({
  task,
  index = 0,
  compact = false,
  showing_in_group = false,
  className,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { complete_task, uncomplete_task, delete_task, update_task, isLoading } = useTask()
  const { groups } = useGroup()

  const cardRef = useRef<HTMLDivElement>(null)
  const checkboxRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Animation on mount
  useEffect(() => {
    if (cardRef.current) {
      gsapUtils.fadeIn(cardRef.current, 0.1 + index * 0.05)
    }
  }, [index])

  // Hover animations
  useEffect(() => {
    const card = cardRef.current
    if (card) {
      const handleMouseEnter = () => gsapUtils.cardHover(card)
      const handleMouseLeave = () => gsapUtils.cardHoverOut(card)

      card.addEventListener("mouseenter", handleMouseEnter)
      card.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter)
        card.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  const handleToggleComplete = async () => {
    if (checkboxRef.current) {
      gsapUtils.buttonPress(checkboxRef.current)
      setTimeout(() => {
        gsapUtils.buttonRelease(checkboxRef.current!)
      }, 100)
    }

    try {
      if (task.is_completed) {
        await uncomplete_task(task.id!)
        toast({ title: "Success", description: "Task marked as incomplete" })
      } else {
        await complete_task(task.id!)
        toast({ title: "Success", description: "Task completed!" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    if (cardRef.current) {
      gsapUtils.fadeOut(cardRef.current)
    }

    try {
      await delete_task(task.id!)
      toast({ title: "Success", description: "Task deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
      setIsDeleting(false)
      if (cardRef.current) {
        gsapUtils.fadeIn(cardRef.current)
      }
    }
  }

  const handleRestore = async () => {
    try {
      await update_task(task.id!, { is_deleted: false })
      toast({ title: "Success", description: "Task restored successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore task",
        variant: "destructive",
      })
    }
  }

  // ✅ جلب اسم المجموعة
  const getGroupName = (groupId?: number) => {
    const group = groups.find((g) => g.id === groupId)
    return group ? group.name : "Unknown Group"
  }

  if (isDeleting) return null

  return (
    <div
      ref={cardRef}
      className={cn(
        "task-card bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 group cursor-pointer relative overflow-hidden",
        task.is_completed && "opacity-70",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex items-start gap-3 relative z-10">
        {/* ✅ Checkbox */}
        {!showing_in_group && (
          <div
            ref={checkboxRef}
            className={cn("cursor-pointer flex items-center justify-center pt-0.5", task.is_deleted && "opacity-50")}
          >
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={handleToggleComplete}
              disabled={isLoading || task.is_deleted}
              className={cn("w-5 h-5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500", task.is_deleted && "border-gray-300")}
            />
          </div>
        )}

        {/* ✅ Task Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <p
            className={cn(
              "text-sm font-medium text-gray-900 leading-snug break-words",
              task.is_completed && "line-through text-gray-500",
              compact && "text-xs"
            )}
          >
            {task.text}
          </p>

          <div className={cn("flex flex-wrap items-center gap-2", compact && "mt-1")}>
            {!showing_in_group && task.group_id && (
              <div className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs">
                <FolderOpen className="h-3 w-3 mr-1" />
                {getGroupName(task.group_id)}
              </div>
            )}

            {task.due_at && (
              <div className="flex items-center bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.due_at).toLocaleDateString()}
              </div>
            )}

            {task.is_deleted && task.deleted_at && (
              <div className="flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs">
                <Trash2 className="h-3 w-3 mr-1" />
                Deleted {new Date(task.deleted_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Dropdown Menu */}
        {!showing_in_group && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-50 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="shadow-lg border-gray-100 bg-white/95">
              {task.is_deleted ? (
                <DropdownMenuItem onClick={handleRestore} className="text-blue-600 hover:bg-blue-50">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
