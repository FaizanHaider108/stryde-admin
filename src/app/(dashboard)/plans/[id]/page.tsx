import Link from "next/link";
import { notFound } from "next/navigation";
import PlanManagePanel from "@/components/plans/PlanManagePanel";
import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import type { PlanResponse } from "@/types";

type Props = { params: Promise<{ id: string }> };

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;

  let plan: PlanResponse;
  try {
    plan = await adminBackendFetch<PlanResponse>(`/api/v1/plans/${id}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader
        title={plan.name}
        description={
          plan.description ??
          `${plan.target_distance} · ${plan.duration_weeks} weeks · ${plan.experience_level ?? "—"}`
        }
        action={
          <Link href="/plans" className="admin-btn-secondary text-sm">
            ← All plans
          </Link>
        }
      />

      <PlanManagePanel initialPlan={plan} />
    </>
  );
}
