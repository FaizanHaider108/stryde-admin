"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import toast from "react-hot-toast";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusHint, setStatusHint] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatusHint("Contacting API… first request to Render can take 1–2 minutes.");

    const controller = new AbortController();
    const clientTimeout = window.setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      let data: { error?: string } = {};
      try {
        data = (await response.json()) as { error?: string };
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Sign in failed.");
      }

      toast.success("Welcome back.");
      const next = searchParams.get("next") || "/";
      window.location.href = next.startsWith("/") ? next : "/";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error(
          "Request timed out. Try again, or point API_BASE_URL to your local backend in .env.local.",
        );
      } else {
        toast.error(error instanceof Error ? error.message : "Sign in failed.");
      }
    } finally {
      window.clearTimeout(clientTimeout);
      setLoading(false);
      setStatusHint(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <LoginCard>
        <LoginHeader />
        <form onSubmit={onSubmit} className="space-y-4">
          <EmailField email={email} setEmail={setEmail} disabled={loading} />
          <PasswordField password={password} setPassword={setPassword} disabled={loading} />
          {statusHint ? (
            <p className="text-center text-xs text-brown/60">{statusHint}</p>
          ) : null}
          <button type="submit" disabled={loading} className="admin-btn-primary w-full">
            {loading ? "Signing in… (please wait)" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-brown/50">
          Login is same-origin (not CORS). The server calls API_BASE_URL from .env.local.
        </p>
      </LoginCard>
    </div>
  );
}

function LoginCard({ children }: { children: React.ReactNode }) {
  return <div className="admin-card w-full max-w-md p-8">{children}</div>;
}

function LoginHeader() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <Image
        src="/Logo.svg"
        alt="Stryde"
        width={140}
        height={42}
        priority
        style={{ width: "auto", height: "auto", maxWidth: 140 }}
      />
      <p className="mt-3 font-righteous text-sm uppercase tracking-widest text-tan">
        Admin Console
      </p>
      <p className="mt-2 text-sm text-brown/60">
        Same email/password as the main app. Email must match ADMIN_ALLOWED_EMAILS.
      </p>
    </div>
  );
}

function EmailField({
  email,
  setEmail,
  disabled,
}: {
  email: string;
  setEmail: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor="email" className="mb-1 block text-sm font-medium text-brown">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        disabled={disabled}
        className="admin-input disabled:opacity-60"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
  );
}

function PasswordField({
  password,
  setPassword,
  disabled,
}: {
  password: string;
  setPassword: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor="password" className="mb-1 block text-sm font-medium text-brown">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={disabled}
        className="admin-input disabled:opacity-60"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-brown/60">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
