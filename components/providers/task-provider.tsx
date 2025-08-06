import { useApi } from "@/hooks/use-api";
import { Task } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  create_task: (task: Omit<Task, 'id'>) => Promise<void>;
  complete_task: (taskId: number) => Promise<void>;
  uncomplete_task: (taskId: number) => Promise<void>;
  delete_task: (taskId: number) => Promise<void>;
  update_task: (taskId: number, updates: Partial<Task>) => Promise<void>;
  fetch_tasks: () => Promise<void>;
  get_task_by_id: (taskId: number) => Task | undefined;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const { get, post, patch, del } = useApi();

  const fetch_tasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get("/api/task/");
      setTasks(response);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const create_task = async (task: Omit<Task, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await post("/api/task/", task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const complete_task = async (taskId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await patch(`/api/task/complete/${taskId}`, {});
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch tasks");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uncomplete_task = async (taskId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await patch(`/api/task/uncomplete/${taskId}`, {});
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));
    } catch (error) {
      console.error("Failed to complete task:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tasks");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const delete_task = async (taskId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await del(`/api/task/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tasks");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const update_task = async (taskId: number, updates: Partial<Task>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await patch(`/api/task/${taskId}`, updates);
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));
    } catch (error) {
      console.error("Failed to update task:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tasks");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const get_task_by_id = (taskId: number): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  };

  useEffect(() => {
    fetch_tasks();
  }, []);

  const value = {
    tasks,
    isLoading,
    error,
    create_task,
    complete_task,
    uncomplete_task,
    delete_task,
    update_task,
    fetch_tasks,
    get_task_by_id
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}