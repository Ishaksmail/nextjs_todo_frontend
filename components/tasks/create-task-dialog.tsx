"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { FileText, Calendar, FolderOpen, X, Plus } from 'lucide-react'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [formData, setFormData] = useState({
    text: "",
    due_at: "",
    group_id: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { post } = useApi()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Task text validation (min 1, max 255 characters)
    if (!formData.text.trim()) {
      newErrors.text = "Task text is required"
    } else if (formData.text.length > 255) {
      newErrors.text = "Task text must be less than 255 characters"
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
        text: formData.text.trim(),
        due_at: formData.due_at || null,
        group_id: formData.group_id ? Number.parseInt(formData.group_id) : null,
      }

      await post("/api/task/", payload)

      toast({
        title: "Success",
        description: "Task created successfully!",
      })

      // Reset form
      setFormData({ text: "", due_at: "", group_id: "" })
      setErrors({})
      onOpenChange(false)
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create task"
      toast({
        title: "Demo Mode",
        description: "Connect to your backend to enable full functionality.",
        variant: "default",
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
    <Dialog  open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 shadow-2xl bg-gray-50">
        <div

          className="relative"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm"

                >
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Create New Task
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    Add a new task to your workflow
                  </DialogDescription>
                </div>
              </div>

            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div

                className="space-y-2"
              >
                <Label htmlFor="task-text" className="text-sm font-medium text-gray-700 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  Task Description
                </Label>
                <Textarea
                  id="task-text"
                  placeholder="What needs to be done?"
                  value={formData.text}
                  onChange={handleInputChange("text")}
                  className={`min-h-[100px] resize-none transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${errors.text ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                />
                {errors.text && (
                  <div

                    className="text-red-500 text-sm"
                  >
                    {errors.text}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div

                  className="space-y-2"
                >
                  <Label htmlFor="due-date" className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    Due Date
                  </Label>
                  <Input
                    id="due-date"
                    type="datetime-local"
                    value={formData.due_at}
                    onChange={handleInputChange("due_at")}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div

                  className="space-y-2"
                >
                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2 text-gray-500" />
                    Group
                  </Label>
                  <select
                    value={formData.group_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, group_id: e.target.value }))}
                    className="w-full h-11 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500/20 bg-white transition-all duration-200 text-sm"
                  >
                    <option value="">Select a group</option>
                    <option value="1">Work Projects</option>
                    <option value="2">Personal Goals</option>
                    <option value="3">Learning</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div

                className="flex justify-end space-x-3 pt-4 border-t border-gray-100"
              >
                <div >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="px-6 h-11 border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                </div>

                <div >
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.text.trim()}
                    className="px-6 h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div

                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Create Task</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
