import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import type { PlanWorkoutResponse, PlanWorkoutUpdatePayload } from "@/types";

type Props = { params: Promise<{ id: string; workoutId: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id, workoutId } = await params;
    const body = (await request.json()) as PlanWorkoutUpdatePayload;
    const workout = await adminBackendFetch<PlanWorkoutResponse>(
      `/api/v1/plans/${id}/workouts/${workoutId}/`,
      { method: "PATCH", body },
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

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const { id, workoutId } = await params;
    await adminBackendFetch(`/api/v1/plans/${id}/workouts/${workoutId}/`, {
      method: "DELETE",
    });
    return new NextResponse(null, { status: 204 });
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
