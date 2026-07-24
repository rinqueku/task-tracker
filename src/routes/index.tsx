import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated, hydrated } = useAuth();
  if (!hydrated) return null;
  if (isAuthenticated) return <Navigate to="/tasks" />;

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Stay on top of your work
      </h1>
      <p className="mt-4 max-w-lg text-muted-foreground">
        Track tasks with categories, filters, and search — built for focus.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/signup"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Get started
        </Link>
        <Link
          to="/signin"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
