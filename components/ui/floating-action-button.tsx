"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"
import { gsapUtils } from "@/lib/gsap-utils"
import gsap from "gsap"

export function FloatingActionButton() {
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Refs for animations
  const fabRef = useRef<HTMLDivElement>(null)
  const plusIconRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial animation
    if (fabRef.current) {
      gsap.set(fabRef.current, { scale: 0 })
      gsap.to(fabRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "elastic.out(1, 0.5)"
      })
    }
  }, [])

  useEffect(() => {
    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && fabRef.current && !fabRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    if (fabRef.current) {
      gsap.to(fabRef.current, {
        scale: 1,
        duration: 0.2
      })
    }
  }

  useEffect(() => {
    // Dropdown animations
    if (dropdownRef.current) {
      if (isOpen) {
        gsap.fromTo(dropdownRef.current,
          { opacity: 0, y: 10, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.2 }
        )
      }
    }

    if (plusIconRef.current) {
      gsap.to(plusIconRef.current, {
        rotation: isOpen ? 45 : 0,
        duration: 0.2
      })
    }
  }, [isOpen])

  const handleInteraction = () => {
    if (fabRef.current) {
      gsap.to(fabRef.current, {
        scale: isOpen ? 1 : 1.1,
        duration: 0.2
      })
    }
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          handleInteraction()
        }
      }}>
        <DropdownMenuTrigger asChild>
          <div
            ref={fabRef}
            className="fixed bottom-6 right-6 z-50"
            onMouseEnter={() => gsap.to(fabRef.current, { scale: 1.1, duration: 0.2 })}
            onMouseLeave={() => gsap.to(fabRef.current, { scale: isOpen ? 1.1 : 1, duration: 0.2 })}
            onMouseDown={() => gsap.to(fabRef.current, { scale: 0.9, duration: 0.1 })}
            onMouseUp={() => handleInteraction()}
          >
            <Button
              className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center border-0"
            >
              <div ref={plusIconRef}>
                <Plus className="h-6 w-6" />
              </div>
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          ref={dropdownRef}
          align="end"
          className="w-48 shadow-lg border-gray-100 mb-2 bg-gray-50"
          onInteractOutside={(event) => {
            event.preventDefault()
          }}
        >
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false)
              setShowTaskDialog(true)
              handleInteraction()
            }}
            className="text-sm cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4" />
            New Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false)
              setShowGroupDialog(true)
              handleInteraction()
            }}
            className="text-sm cursor-pointer"
          >
            <Users className="mr-2 h-4 w-4" />
            New Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTaskDialog open={showTaskDialog} onOpenChange={setShowTaskDialog} />
      <CreateGroupDialog open={showGroupDialog} onOpenChange={setShowGroupDialog} />
    </>
  )
}