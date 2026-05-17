import { NextRequest, NextResponse } from "next/server";
import { adminPlatformFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";

type Props = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, { params }: Props) {
  const { path } = await params;
  const suffix = path.join("/");
  const target = `/${suffix}${request.nextUrl.search}`;

  let body: unknown;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  try {
    const data = await adminPlatformFetch(target, {
      method: request.method as "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
      body,
    });
    return NextResponse.json(data ?? { ok: true });
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

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
