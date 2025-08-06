"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Users, FileText, Plus } from 'lucide-react'
import { useGroup } from "../providers/group-provider"

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { create_group } = useGroup()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Group name must be at least 3 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Group name must be less than 100 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      }

      await create_group(payload)

      toast({
        title: "Success",
        description: "Group created successfully!",
      })

      setFormData({ name: "", description: "" })
      setErrors({})
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 shadow-2xl bg-gray-50">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Create New Group
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    Organize your tasks into groups
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="group-name" className="text-sm font-medium text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  type="text"
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  className={`h-11 transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                />
                {errors.name && (
                  <div className="text-red-500 text-sm">
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description" className="text-sm font-medium text-gray-700 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  Description
                  <span className="text-xs text-gray-400 ml-1">(Optional)</span>
                </Label>
                <Textarea
                  id="group-description"
                  placeholder="Describe this group and its purpose..."
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Preview Card */}
              {formData.name && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{formData.name}</h4>
                      {formData.description && (
                        <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6 h-11 border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="px-6 h-11 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create Group</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
