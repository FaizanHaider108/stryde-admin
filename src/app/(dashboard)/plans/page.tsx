import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import type { PlanResponse } from "@/types";
import { FiAlertCircle, FiCalendar } from "react-icons/fi";

export default async function PlansPage() {
  let plans: PlanResponse[] = [];
  let error: string | null = null;

  try {
    plans = await adminBackendFetch<PlanResponse[]>("/api/v1/plans/");
  } catch (e) {
    error =
      e instanceof ApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Could not load training plans.";
  }

  return (
    <>
      <PageHeader
        title="Training plans"
        description="Catalog templates shown in the app. Each plan needs metadata plus 7 days per week with pace, distance, and duration."
        action={
          <Link href="/plans/new" className="admin-btn-primary inline-flex items-center gap-2 text-sm">
            <FiCalendar size={16} />
            New plan
          </Link>
        }
      />

      {error ? (
        <div className="admin-card flex items-start gap-3 border-red-200 bg-red-50 p-5 text-red-900">
          <FiAlertCircle className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-medium">Could not load plans</p>
            <p className="mt-1 text-sm opacity-90">{error}</p>
            <p className="mt-2 text-xs opacity-80">
              Check API_BASE_URL, sign in again, and ensure the backend is running.
            </p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-brown/60">
          No template plans yet.{" "}
          <Link href="/plans/new" className="text-tan underline">
            Create the first plan
          </Link>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <PlansTable plans={plans} />
        </div>
      )}
    </>
  );
}

function PlansTable({ plans }: { plans: PlanResponse[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-light-brown/80 bg-light-brown/30 text-brown/70">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Distance</th>
            <th className="px-4 py-3 font-medium">Weeks</th>
            <th className="px-4 py-3 font-medium">Workouts</th>
            <th className="px-4 py-3 font-medium">Level</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => {
            const days = plan.workouts?.length ?? 0;
            const expected = plan.duration_weeks * 7;
            const complete = days >= expected;
            const statusClass = complete
              ? "bg-green-accent/20 text-green-accent"
              : "bg-amber-100 text-amber-900";
            return (
              <tr
                key={plan.id}
                className="border-b border-light-brown/40 last:border-0 hover:bg-light-brown/20"
              >
                <td className="px-4 py-3 font-medium text-brown">{plan.name}</td>
                <td className="px-4 py-3 text-brown/70">{plan.target_distance}</td>
                <td className="px-4 py-3 text-brown/70">{plan.duration_weeks}</td>
                <td className="px-4 py-3 text-brown/70">
                  {days}/{expected}
                </td>
                <td className="px-4 py-3 text-brown/70">{plan.experience_level ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + statusClass}>
                    {complete ? "Complete" : "Needs days"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={"/plans/" + plan.id} className="text-sm text-tan hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
