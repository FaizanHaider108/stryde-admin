import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import type { PlanWorkoutCreatePayload, PlanWorkoutResponse } from "@/types";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = (await request.json()) as PlanWorkoutCreatePayload;
    const workout = await adminBackendFetch<PlanWorkoutResponse>(
      `/api/v1/plans/${id}/workouts/`,
      { method: "POST", body },
    );
    return NextResponse.json(workout);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
