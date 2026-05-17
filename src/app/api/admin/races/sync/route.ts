import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await adminBackendFetch<{ message: string; local_race_id: string }>(
      "/api/v1/races/sync",
      { method: "POST", body },
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Sync failed." }, { status: 500 });
  }
}
