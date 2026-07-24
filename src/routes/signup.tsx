import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { api, extractApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ErrorMessage, Field, btnPrimary, inputClass } from "../components/ui-bits";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

function SignUpPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      // POST /api/auth/register
      const { data } = await api.post("/auth/register", { name, email, password });
      const token = data?.token ?? data?.access_token ?? data?.jwt;
      if (token) {
        setToken(token);
        router.navigate({ to: "/tasks" });
      } else {
        router.navigate({ to: "/signin" });
      }
    } catch (err) {
      setError(extractApiError(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Start managing your tasks.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Name" htmlFor="name">
          <input id="name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="password">
          <input id="password" type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </Field>
        <ErrorMessage message={error} />
        <button type="submit" disabled={loading} className={btnPrimary + " w-full"}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/signin" className="text-foreground underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
