export interface User {
  id?: number
  username: string
  password?: string
  created_at?: string
  emails?: EmailEntity[]
}

export interface EmailEntity {
  id?: number
  email: string
  is_verified: boolean
  user_id: number
  created_at?: string
}

export interface Task {
  id?: number
  text?: string
  is_deleted?: boolean
  is_completed?: boolean
  deleted_at?: string
  completed_at?: string
  due_at?: string
  created_at?: string
  group_id?: number
}

export interface Group {
  id?: number
  name?: string
  description?: string
  is_deleted: boolean
  deleted_at?: string
  created_at?: string
  updated_at?: string
  tasks?: Task[]
}
