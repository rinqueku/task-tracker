import type { ReactNode } from "react";

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50";

export const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="glass w-full max-w-lg rounded-lg border border-border bg-background p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
