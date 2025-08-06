"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { FolderOpen, Users, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GSAPLoadingSpinner } from "@/components/ui/gsap-loading-spinner"
import { gsapUtils } from "@/lib/gsap-utils"
import GroupCard from "@/components/groups/GroupCard"
import { useGroup } from "@/components/providers/group-provider"

export default function GroupsPage() {
  const { groups, isLoading, error, fetch_groups } = useGroup()
  const [initialized, setInitialized] = useState(false)

  // ✅ استبعاد المجموعات المحذوفة
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => !group.is_deleted)
  }, [groups])

  // Refs for animations
  const pageRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  const groupsRef = useRef<HTMLDivElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  // Retry fetching
  const handleRetry = () => {
    fetch_groups()
  }

  // Initialize animations
  useEffect(() => {
    if (!isLoading && !initialized) {
      if (pageRef.current) gsapUtils.pageEnter(pageRef.current)
      if (headerRef.current) gsapUtils.fadeIn(headerRef.current, 0.1)
      if (error && alertRef.current) gsapUtils.fadeIn(alertRef.current, 0.2)
      setInitialized(true)
    }
  }, [isLoading, error, initialized])

  // Animate group cards or empty state
  useEffect(() => {
    if (!isLoading) {
      if (filteredGroups.length === 0 && emptyStateRef.current) {
        gsapUtils.fadeIn(emptyStateRef.current, 0.1)
        if (iconRef.current) {
          gsapUtils.fadeIn(iconRef.current, 0.1)
          setTimeout(() => gsapUtils.iconHover(iconRef.current as HTMLElement), 1200)
        }
      } else if (groupsRef.current) {
        const groupCards = groupsRef.current.querySelectorAll('.group-card')
        gsapUtils.staggerIn(Array.from(groupCards) as HTMLElement[], 0.1)
      }
    }
  }, [isLoading, filteredGroups])



  return (
    <div ref={pageRef} className="space-y-6 opacity-0">
      {/* Error Alert */}
      {error && (
        <div ref={alertRef} className="opacity-0">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {typeof error === 'string' ? error : 'An unexpected error occurred'}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-2 bg-transparent"
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
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Groups</h1>
        </div>
        <p className="text-gray-600 text-sm">Organize your tasks and track progress efficiently</p>
      </div>

      {/* Groups Grid or Empty State */}
      {isLoading ?
        (<div className="flex items-center justify-center h-64">
          <div className="text-center">
            <GSAPLoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Loading your groups...</p>
          </div>

        </div>) : (<>
          {filteredGroups.length === 0 ? (
            <div ref={emptyStateRef} className="text-center py-16 opacity-0">
              <div
                ref={iconRef}
                className="opacity-0 cursor-pointer inline-block"
                onMouseEnter={(e) => gsapUtils.iconHover(e.currentTarget as HTMLElement)}
                onMouseLeave={(e) => gsapUtils.iconHoverOut(e.currentTarget as HTMLElement)}
              >
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              </div>
              <div className="text-gray-500 text-lg mb-2">No groups available</div>
              <p className="text-gray-400 text-sm">Create your first group to get started</p>
            </div>
          ) : (
            <div ref={groupsRef} className="space-y-6">
              {filteredGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}</>)}
    </div>
  )
}
