import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { API_BASE_URL } from "@/lib/api";
import type { BackendHealth } from "@/types";

export default async function SystemPage() {
  let health: BackendHealth = { status: "error" };
  let healthError: string | null = null;

  try {
    health = await adminBackendFetch<BackendHealth>("/api/v1/health");
  } catch (error) {
    healthError = error instanceof Error ? error.message : "Unknown error";
  }

  const allowedEmails =
    process.env.ADMIN_ALLOWED_EMAILS?.split(",").map((e) => e.trim()).filter(Boolean) ??
    [];

  return (
    <>
      <PageHeader
        title="System"
        description="Backend connectivity and admin configuration (server-side only)."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="API endpoint" value={API_BASE_URL} />
        <InfoCard
          title="Health check"
          value={health.status === "ok" ? "Healthy" : "Unavailable"}
          hint={healthError ?? undefined}
          variant={health.status === "ok" ? "ok" : "error"}
        />
        <InfoCard
          title="Allowlisted admins"
          value={String(allowedEmails.length || "Dev mode (no allowlist)")}
          hint={
            allowedEmails.length
              ? allowedEmails.join(", ")
              : "Set ADMIN_ALLOWED_EMAILS in production."
          }
        />
        <InfoCard
          title="Security"
          value="HttpOnly cookies + email allowlist"
          hint="Tokens never exposed to client JavaScript."
        />
      </div>
    </>
  );
}

function InfoCard({
  title,
  value,
  hint,
  variant = "default",
}: {
  title: string;
  value: string;
  hint?: string;
  variant?: "default" | "ok" | "error";
}) {
  const valueClass =
    variant === "ok"
      ? "text-green-accent"
      : variant === "error"
        ? "text-red-600"
        : "text-brown";

  return (
    <div className="admin-card p-5">
      <h2 className="text-sm font-medium text-brown/60">{title}</h2>
      <p className={`mt-2 text-lg font-semibold ${valueClass}`}>{value}</p>
      {hint ? <p className="mt-2 text-xs text-brown/50 break-words">{hint}</p> : null}
    </div>
  );
}
