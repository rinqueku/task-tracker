import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { api, extractApiError } from "../lib/api";
import type { Category, Task, TaskStatus, TasksListResponse } from "../lib/types";
import { TASK_STATUSES } from "../lib/types";
import {
  ErrorMessage,
  Field,
  Modal,
  Spinner,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "../components/ui-bits";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

const PAGE_LIMIT = 10;

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function TasksPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [statusFilter, setStatusFilter] = useState<"" | TaskStatus>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit: PAGE_LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      // GET /api/tasks
      const { data } = await api.get<TasksListResponse | Task[]>("/tasks", { params });
      if (Array.isArray(data)) {
        setTasks(data);
        setTotalPages(1);
      } else {
        setTasks(data.data ?? []);
        setTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total ?? 0) / (data.limit ?? PAGE_LIMIT))));
      }
    } catch (err) {
      setError(extractApiError(err, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, debouncedSearch]);

  const fetchCategories = useCallback(async () => {
    try {
      // GET /api/categories
      const { data } = await api.get<Category[] | { data: Category[] }>("/categories");
      setCategories(Array.isArray(data) ? data : (data.data ?? []));
    } catch {
      // silent — categories are optional filter data
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your tasks</h1>
          <p className="text-sm text-muted-foreground">Filter, search, and manage your work.</p>
        </div>
        <button className={btnPrimary} onClick={() => setCreating(true)}>
          New task
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          className={inputClass}
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={inputClass}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | TaskStatus)}
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-8">
          <Spinner label="Loading tasks..." />
        </div>
      ) : error ? (
        <div className="space-y-3">
          <ErrorMessage message={error} />
          <button className={btnSecondary} onClick={fetchTasks}>
            Try again
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No tasks yet. Create your first one.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              categories={categories}
              onEdit={() => setEditing(t)}
              onDelete={() => setDeleting(t)}
            />
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className={btnSecondary}
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className={btnSecondary}
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <TaskFormModal
        open={creating}
        onClose={() => setCreating(false)}
        categories={categories}
        onSaved={() => {
          setCreating(false);
          fetchTasks();
        }}
      />
      <TaskFormModal
        open={!!editing}
        task={editing ?? undefined}
        onClose={() => setEditing(null)}
        categories={categories}
        onSaved={() => {
          setEditing(null);
          fetchTasks();
        }}
      />
      <DeleteTaskModal
        task={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null);
          fetchTasks();
        }}
      />
    </main>
  );
}

function TaskRow({
  task,
  categories,
  onEdit,
  onDelete,
}: {
  task: Task;
  categories: Category[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const categoryName =
    task.category?.name ??
    categories.find((c) => String(c.id) === String(task.category_id))?.name ??
    "—";
  const statusLabel = TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status;
  const due = task.due_date ? new Date(task.due_date).toLocaleDateString() : "—";

  return (
    <li className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="truncate font-medium">{task.title}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
            {statusLabel}
          </span>
          <span>Category: {categoryName}</span>
          <span>Due: {due}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button className={btnSecondary} onClick={onEdit}>
          Edit
        </button>
        <button className={btnDanger} onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}

function TaskFormModal({
  open,
  task,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  task?: Task;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!task;
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [categoryId, setCategoryId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!open) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    initialized.current = true;
    setError(null);
    if (task) {
      setTitle(task.title ?? "");
      setStatus(task.status ?? "pending");
      setCategoryId(task.category_id != null ? String(task.category_id) : "");
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
      setDescription(task.description ?? "");
    } else {
      setTitle("");
      setStatus("pending");
      setCategoryId("");
      setDueDate("");
      setDescription("");
    }
  }, [open, task]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        status,
        category_id: categoryId ? categoryId : null,
        due_date: dueDate || null,
        description: description || null,
      };
      if (isEdit && task) {
        // PUT /api/tasks/:id
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        // POST /api/tasks
        await api.post("/tasks", payload);
      }
      onSaved();
    } catch (err) {
      setError(extractApiError(err, "Could not save task"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit task" : "New task"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Title" htmlFor="task-title">
          <input
            id="task-title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="task-status">
            <select
              id="task-status"
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category" htmlFor="task-category">
            <select
              id="task-category"
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Due date" htmlFor="task-due">
          <input
            id="task-due"
            type="date"
            className={inputClass}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>
        <Field label="Description" htmlFor="task-desc">
          <textarea
            id="task-desc"
            className={inputClass + " min-h-24"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <ErrorMessage message={error} />
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteTaskModal({
  task,
  onClose,
  onDeleted,
}: {
  task: Task | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => task?.title ?? "", [task]);

  async function confirmDelete() {
    if (!task) return;
    setDeleting(true);
    setError(null);
    try {
      // DELETE /api/tasks/:id
      await api.delete(`/tasks/${task.id}`);
      onDeleted();
    } catch (err) {
      setError(extractApiError(err, "Could not delete task"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal open={!!task} onClose={onClose} title="Delete task">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete <span className="font-medium text-foreground">{title}</span>? This action cannot be undone.
      </p>
      <div className="mt-4">
        <ErrorMessage message={error} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button className={btnSecondary} onClick={onClose} disabled={deleting}>
          Cancel
        </button>
        <button className={btnDanger} onClick={confirmDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
