"use client"

import { useState, useRef, useEffect } from "react"
import type { Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Trash2, Calendar, FolderOpen } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { gsapUtils } from "@/lib/gsap-utils"

interface TaskCardProps {
  task: Task
  onUpdate: () => void
  isDemo?: boolean
  index?: number
  compact?: boolean
}

export function TaskCard({ task, onUpdate, isDemo = false, index = 0, compact = false }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { patch, del } = useApi()
  const { toast } = useToast()

  const cardRef = useRef<HTMLDivElement>(null)
  const checkboxRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // ✅ تشغيل أنيميشن عند دخول البطاقة
  useEffect(() => {
    if (cardRef.current) {
      gsapUtils.fadeIn(cardRef.current)
    }
  }, [])

  // ✅ أنيميشن hover للبطاقة
  useEffect(() => {
    const card = cardRef.current
    if (card) {
      const handleMouseEnter = () => gsapUtils.cardHover(card)
      const handleMouseLeave = () => gsapUtils.cardHoverOut(card)

      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter)
        card.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  const handleToggleComplete = async () => {
    if (isDemo) {
      toast({ title: "Demo Mode", description: "Connect to your backend to enable full functionality." })
      return
    }

    setIsLoading(true)

    if (checkboxRef.current) {
      gsapUtils.buttonPress(checkboxRef.current)
      setTimeout(() => {
        if (checkboxRef.current) {
          gsapUtils.buttonRelease(checkboxRef.current)
        }
      }, 100)
    }

    try {
      const endpoint = task.is_completed ? `/api/task/uncomplete/${task.id}` : `/api/task/complete/${task.id}`
      await patch(endpoint, {})
      onUpdate()
      toast({
        title: "Success",
        description: task.is_completed ? "Task marked as incomplete" : "Task completed!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (isDemo) {
      toast({ title: "Demo Mode", description: "Connect to your backend to enable full functionality." })
      return
    }

    setIsDeleting(true)
    if (cardRef.current) {
      gsapUtils.fadeOut(cardRef.current)
    }

    try {
      await del(`/api/task/${task.id}`)
      toast({ title: "Success", description: "Task deleted successfully" })
      setTimeout(onUpdate, 300)
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

  const getGroupName = (groupId?: number) => {
    const groupNames: { [key: number]: string } = {
      1: "Work Projects",
      2: "Personal Goals",
      3: "Learning",
    }
    return groupId ? groupNames[groupId] : null
  }

  if (isDeleting) return null

  return (
    <div
      ref={cardRef}
      className={cn(
        "task-card bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 hover:border-gray-200 group cursor-pointer relative overflow-hidden",
        task.is_completed && "opacity-60",
        compact ? "p-3" : "p-4"
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex items-start space-x-3 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 items-center justify-start">
            <div
              ref={checkboxRef}
              className="cursor-pointer flex items-center justify-center"
              onMouseDown={(e) => gsapUtils.buttonPress(e.currentTarget)}
              onMouseUp={(e) => gsapUtils.buttonRelease(e.currentTarget)}
            >
              <Checkbox
                checked={task.is_completed}
                onCheckedChange={handleToggleComplete}
                disabled={isLoading}
                className="w-5 h-5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 transition-all duration-200"
              />
            </div>
            <p
              className={cn(
                "text-sm font-medium text-gray-900 leading-none",
                task.is_completed && "line-through text-gray-500",
                compact && "text-xs"
              )}
            >
              {task.text}
            </p>
          </div>

          <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-2" : "mt-3")}>
            {task.group_id && (
              <div
                className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium cursor-pointer text-xs"
                onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget)}
                onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget)}
              >
                <FolderOpen className="h-3 w-3 mr-1" />
                {getGroupName(task.group_id)}
              </div>
            )}

            {task.due_at && (
              <div
                className="flex items-center bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-medium cursor-pointer text-xs"
                onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget)}
                onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget)}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.due_at).toLocaleDateString()}
              </div>
            )}

            {task.created_at && (
              <span className="text-gray-400 text-xs">
                {new Date(task.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-50 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget)}
              onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shadow-lg border-gray-100 bg-white/95">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 text-sm hover:bg-red-50 transition-colors duration-200"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
