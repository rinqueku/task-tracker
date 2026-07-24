import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AuthProvider, useAuth } from "../lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Task Tracker — Manage your work" },
      { name: "description", content: "A clean, minimal task tracker app." },
      { property: "og:title", content: "Task Tracker — Manage your work" },
      { property: "og:description", content: "A clean, minimal task tracker app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const { isAuthenticated, hydrated, logout } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dark-mode");
    const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored !== null ? stored === "true" : preferDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dark-mode", String(next));
  }

  if (!hydrated) return null;
  return (
    <header className="border-b border-border/60 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-base font-semibold tracking-tight">
          Task Tracker
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <button
            onClick={toggleDark}
            className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
            aria-label="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/tasks" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
                Tasks
              </Link>
              <Link to="/categories" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
                Categories
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.navigate({ to: "/signin" });
                }}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const path = router.state.location.pathname;
  const isAuth = path === "/signin" || path === "/signup";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="relative min-h-screen text-foreground">
          <div className={"ambient-bg" + (isAuth ? " ambient-bg-vibrant" : "")} aria-hidden="true">
            <span />
          </div>
          <Header />
          <Outlet />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
