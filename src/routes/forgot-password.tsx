import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { api, extractApiError } from '../lib/api';
import { ErrorMessage, Field, btnPrimary, btnSecondary, inputClass } from '../components/ui-bits';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setToken(data?.token ?? '');
      setSubmitted(true);
    } catch (err) {
      setError(extractApiError(err, 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <div className="glass rounded-xl p-6 shadow-xl">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If that email exists, a reset link has been sent.
          </p>
          {token && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                Your reset token (copy this):
              </p>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono break-all">
                {token}
              </pre>
            </div>
          )}
          <div className="mt-6 space-y-2">
            <Link to="/reset-password" className={btnPrimary + ' w-full text-center block'}>
              Go to reset password
            </Link>
            <button onClick={() => setSubmitted(false)} className={btnSecondary + ' w-full'}>
              Try another email
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <div className="glass rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we'll send you a reset token.
        </p>
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
          <ErrorMessage message={error} />
          <button type="submit" disabled={loading} className={btnPrimary + ' w-full'}>
            {loading ? 'Sending...' : 'Send reset token'}
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