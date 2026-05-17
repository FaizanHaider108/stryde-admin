import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import type { PlanCreatePayload, PlanResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlanCreatePayload;
    const plan = await adminBackendFetch<PlanResponse>("/api/v1/plans/", {
      method: "POST",
      body,
    });
    return NextResponse.json(plan);
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
