import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { api, extractApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ErrorMessage, Field, btnPrimary, inputClass } from "../components/ui-bits";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
});

function SignInPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      // POST /api/auth/login
      const { data } = await api.post("/auth/login", { email, password });
      const token = data?.token ?? data?.access_token ?? data?.jwt;
      if (!token) throw new Error("No token returned from server.");
      setToken(token);
      router.navigate({ to: "/tasks" });
    } catch (err) {
      setError(extractApiError(err, "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <ErrorMessage message={error} />
        <button type="submit" disabled={loading} className={btnPrimary + " w-full"}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        No account?{" "}
        <Link to="/signup" className="text-foreground underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
