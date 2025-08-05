import { Task } from "@/types";
import { createContext, useContext, useState } from "react";


interface TaskContextType {
    tasks: Task[]
    isLoading: boolean
    create_task: () => Promise<void>
    delete_task: () => Promise<void>
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);


export function useTask() {
    const context = useContext(TaskContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[] | null>([])
    const [isLoading, setIsLoading] = useState(true)

    


}