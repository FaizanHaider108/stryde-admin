import Link from "next/link";
import PlanForm from "@/components/PlanForm";
import PageHeader from "@/components/PageHeader";

export default function NewPlanPage() {
  return (
    <>
      <PageHeader
        title="New training plan"
        description="Create a template plan for runners to enroll in."
        action={
          <Link href="/plans" className="admin-btn-secondary text-sm">
            ← All plans
          </Link>
        }
      />
      <PlanForm />
    </>
  );
}
