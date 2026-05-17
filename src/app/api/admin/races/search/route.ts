import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import type { ExternalRaceResult } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Query required." }, { status: 400 });
  }

  try {
    const results = await adminBackendFetch<ExternalRaceResult[]>(
      `/api/v1/races/search/external?query=${encodeURIComponent(q)}`,
    );
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
