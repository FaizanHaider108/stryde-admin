import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";

type Props = { params: Promise<{ uid: string }> };

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const { uid } = await params;
    await adminBackendFetch(`/api/v1/admin/users/${uid}/`, {
      method: "DELETE",
    });
    return NextResponse.json({ ok: true });
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
