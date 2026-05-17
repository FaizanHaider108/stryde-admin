import { NextResponse } from "next/server";
import { ApiError, backendFetch } from "@/lib/api";
import {
  applyAdminCookies,
  clearAdminCookies,
  isEmailAllowed,
} from "@/lib/admin-auth";
import type { PersonalInfoOut, TokenResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    if (!isEmailAllowed(email)) {
      return NextResponse.json(
        {
          error:
            "This email is not on the admin allowlist. Check ADMIN_ALLOWED_EMAILS in .env.local and restart npm run dev.",
        },
        { status: 403 },
      );
    }

    const tokens = await backendFetch<TokenResponse>("/api/v1/auth/signin", {
      method: "POST",
      body: { email, password },
      timeoutMs: 90_000,
    });

    const profile = await backendFetch<PersonalInfoOut>("/api/v1/profile/me", {
      token: tokens.access_token,
      timeoutMs: 30_000,
    });

    const profileEmail = profile.email.trim().toLowerCase();
    if (!isEmailAllowed(profileEmail)) {
      await clearAdminCookies();
      return NextResponse.json(
        {
          error: `Signed in, but account email "${profile.email}" is not on the admin allowlist.`,
        },
        { status: 403 },
      );
    }

    const response = NextResponse.json({
      uid: profile.uid,
      email: profile.email,
      full_name: profile.full_name,
    });

    return applyAdminCookies(response, tokens, profile);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
    return NextResponse.json(
      { error: "Could not sign in. Check your credentials and try again." },
      { status: 500 },
    );
  }
}
