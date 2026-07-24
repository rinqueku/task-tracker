import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { api, extractApiError } from '../lib/api';
import { ErrorMessage, Field, btnPrimary, btnSecondary, inputClass } from '../components/ui-bits';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token || !password) {
      setError('Token and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSubmitted(true);
    } catch (err) {
      setError(extractApiError(err, 'Could not reset password'));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <div className="glass rounded-xl p-6 shadow-xl">
          <h1 className="text-2xl font-semibold tracking-tight">Password reset</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been reset successfully.
          </p>
          <div className="mt-6">
            <Link to="/signin" className={btnPrimary + ' w-full text-center block'}>
              Sign in with new password
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="glass rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the reset token and your new password.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Reset token" htmlFor="token">
            <input
              id="token"
              className={inputClass}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from the previous step"
            />
          </Field>
          <Field label="New password" htmlFor="password">
            <input
              id="password"
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <ErrorMessage message={error} />
          <button type="submit" disabled={loading} className={btnPrimary + ' w-full'}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/signin" className="text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}