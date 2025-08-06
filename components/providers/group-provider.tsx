"use client";

import { useApi } from "@/hooks/use-api";
import { Group } from "@/types";
import { createContext, useContext, useEffect, useState, useRef } from "react";

interface GroupContextType {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  create_group: (group: Omit<Group, 'id'>) => Promise<void>;
  delete_group: (groupId: number) => Promise<void>;
  update_group: (groupId: number, updates: Partial<Group>) => Promise<void>;
  fetch_groups: () => Promise<void>;
  get_group_by_id: (groupId: number) => Group | undefined;
  setError: (error: string | null) => void;
}

export const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { get, post, patch, del } = useApi();
  const fetchedOnce = useRef(false); // ✅ منع التكرار

  // ✅ جلب المجموعات
  const fetch_groups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get("/api/group/");
      setGroups(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ إنشاء مجموعة جديدة
  const create_group = async (group: Omit<Group, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const newGroup = await post("/api/group/", group);
      setGroups((prev) => [...prev, newGroup]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ حذف مجموعة
  const delete_group = async (groupId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await del(`/api/group/${groupId}`);
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ تعديل مجموعة
  const update_group = async (groupId: number, updates: Partial<Group>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedGroup = await patch(`/api/group/${groupId}`, updates);
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ? { ...group, ...updatedGroup } : group
        )
      );
    } catch (err) {
      console.error("Failed to update group:", err);
      setError(err instanceof Error ? err.message : "Failed to update group");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ الحصول على مجموعة عبر الـ ID
  const get_group_by_id = (groupId: number): Group | undefined => {
    return groups.find((group) => group.id === groupId);
  };

  // ✅ جلب المجموعات مرة واحدة فقط
  useEffect(() => {
    if (!fetchedOnce.current) {
      fetch_groups();
      fetchedOnce.current = true;
    }
  }, []);

  const value = {
    groups,
    isLoading,
    error,
    create_group,
    delete_group,
    update_group,
    fetch_groups,
    get_group_by_id,
    setError,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}
