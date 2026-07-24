export interface Category {
  id: string | number;
  name: string;
}

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: TaskStatus;
  category_id?: string | number | null;
  category?: Category | null;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TasksListResponse {
  data: Task[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];
