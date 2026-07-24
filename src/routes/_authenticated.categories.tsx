import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, extractApiError } from "../lib/api";
import type { Category } from "../lib/types";
import {
  ErrorMessage,
  Spinner,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "../components/ui-bits";

export const Route = createFileRoute("/_authenticated/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Category[] | { data: Category[] }>("/categories");
      setCategories(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err) {
      setError(extractApiError(err, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!name.trim()) {
      setCreateError("Name is required.");
      return;
    }
    setCreating(true);
    try {
      // POST /api/categories
      await api.post("/categories", { name: name.trim() });
      setName("");
      fetchCategories();
    } catch (err) {
      setCreateError(extractApiError(err, "Could not create category"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <p className="text-sm text-muted-foreground">Organize your tasks by category.</p>

      <form onSubmit={onCreate} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          className={inputClass}
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className={btnPrimary} disabled={creating}>
          {creating ? "Adding..." : "Add category"}
        </button>
      </form>
      <div className="mt-2">
        <ErrorMessage message={createError} />
      </div>

      <div className="mt-8">
        {loading ? (
          <Spinner label="Loading categories..." />
        ) : error ? (
          <div className="space-y-3">
            <ErrorMessage message={error} />
            <button className={btnSecondary} onClick={fetchCategories}>
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No categories yet.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
            {categories.map((c) => (
              <li key={c.id} className="p-4 text-sm">
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
