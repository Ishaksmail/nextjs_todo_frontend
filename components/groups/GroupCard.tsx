"use client"

import { useState, useEffect, useRef } from "react"
import { TaskCard } from "@/components/tasks/task-card"
import type { Group } from "@/types"
import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronDown, ChevronRight, MoreHorizontal, Trash2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { gsapUtils } from "@/lib/gsap-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useToast } from "../ui/use-toast"
import { useGroup } from "../providers/group-provider"

export default function GroupCard({ group }: { group: Group }) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)

    const cardRef = useRef<HTMLDivElement>(null)
    const menuButtonRef = useRef<HTMLButtonElement>(null)

    const { delete_group } = useGroup()
    const { toast } = useToast()

    // Animation on mount
    useEffect(() => {
        if (cardRef.current) {
            gsapUtils.pageEnter(cardRef.current)
        }
    }, [])

    // Handle delete group
    const handleDelete = async () => {
        setIsDeleting(true)
        if (cardRef.current) gsapUtils.fadeOut(cardRef.current)
        if (group.id) {
            try {
                await delete_group(group?.id)
                toast({ title: "Success", description: "Group deleted successfully" })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete group",
                    variant: "destructive",
                })
                setIsDeleting(false)
                if (cardRef.current) gsapUtils.fadeIn(cardRef.current)
            }
        }
    }

    const activeTasks = group.tasks?.filter((task) => !task.is_completed && !task.is_deleted) || []
    const completedTasks = group.tasks?.filter((task) => task.is_completed && !task.is_deleted) || []
    const totalTasks = activeTasks.length + completedTasks.length

    if (isDeleting) return null

    return (
        <div
            ref={cardRef}
            className="group group-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
            <Collapsible open={isExpanded} onOpenChange={() => setIsExpanded(!isExpanded)}>
                {/* ✅ استخدام asChild لمنع <button> بداخل <button> */}
                <CollapsibleTrigger asChild>
                    <div className="w-full p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900 mr-3">{group.name}</h3>
                                </div>
                                {group.description && <p className="text-gray-600 mb-3">{group.description}</p>}
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>{totalTasks} tasks</span>
                                    {completedTasks.length > 0 && <span>{completedTasks.length} completed</span>}
                                    {group.created_at && <span>Created {new Date(group.created_at).toLocaleDateString()}</span>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
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

                                {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-6 pb-6 border-t border-gray-100" style={{ overflow: "hidden" }}>
                        <div className="space-y-4 mt-4">
                            {activeTasks.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        Active Tasks ({activeTasks.length})
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                compact={true}
                                                showing_in_group={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {completedTasks.length > 0 && (
                                <div>
                                    <div className="flex items-center mb-3">
                                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                        <h4 className="text-sm font-medium text-gray-700">
                                            Completed Tasks ({completedTasks.length})
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {completedTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                compact={true}
                                                showing_in_group={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
