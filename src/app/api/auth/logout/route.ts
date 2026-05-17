import { NextResponse } from "next/server";
import { clearAdminCookies, getAccessToken } from "@/lib/admin-auth";
import { backendFetch } from "@/lib/api";

export async function POST() {
  const token = await getAccessToken();
  if (token) {
    try {
      await backendFetch("/api/v1/auth/logout", { method: "POST", token });
    } catch {
      /* backend logout is best-effort */
    }
  }
  await clearAdminCookies();
  return NextResponse.json({ ok: true });
}
