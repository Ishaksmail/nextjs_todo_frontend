"use client"

import { useEffect, useRef, useState } from "react"
import type { Group } from "@/types"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trash2, Users } from "lucide-react"
import { gsapUtils } from "@/lib/gsap-utils"
import { useToast } from "../ui/use-toast"
import { useGroup } from "../providers/group-provider"

export default function GroupDeleteCard({ group }: { group: Group }) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    // const { restore_group, permanent_delete_group } = useGroup()
    const { toast } = useToast()

    // Animation on mount
    useEffect(() => {
        if (cardRef.current) {
            gsapUtils.pageEnter(cardRef.current)
        }
    }, [])

    // ✅ Restore deleted group
    const handleRestore = async () => {
        if (!group?.id) return
        setIsProcessing(true)
        try {
            //await restore_group(group.id)
            toast({ title: "Success", description: "Group restored successfully" })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to restore group",
                variant: "destructive",
            })
            setIsProcessing(false)
        }
    }

    // ✅ Permanently delete group
    const handlePermanentDelete = async () => {
        if (!group?.id) return
        setIsProcessing(true)
        if (cardRef.current) gsapUtils.fadeOut(cardRef.current)

        try {
            //await permanent_delete_group(group.id)
            toast({ title: "Deleted", description: "Group permanently removed" })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete group permanently",
                variant: "destructive",
            })
            setIsProcessing(false)
            if (cardRef.current) gsapUtils.fadeIn(cardRef.current)
        }
    }

    if (isProcessing) return null

    return (
        <div
            ref={cardRef}
            className="relative bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-300 flex flex-col"
        >
            {/* Icon & Group Info */}
            <div className="flex items-start mb-3">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {group.name}
                    </h3>
                    {group.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {group.description}
                        </p>
                    )}
                    {group.deleted_at && (
                        <p className="text-xs text-red-500 font-medium mt-2">
                            Deleted on {new Date(group.deleted_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestore}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restore
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handlePermanentDelete}
                    className="bg-red-600 hover:bg-red-700"
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Permanently
                </Button>
            </div>
        </div>
    )
}
