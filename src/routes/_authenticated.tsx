import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthGate,
});

function AuthGate() {
  const { isAuthenticated, hydrated } = useAuth();
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/signin" />;
  return <Outlet />;
}
