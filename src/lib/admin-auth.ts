import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api";
import type { AdminSession, PersonalInfoOut, TokenResponse } from "@/types";

export const ACCESS_COOKIE = "stryde_admin_access";
export const REFRESH_COOKIE = "stryde_admin_refresh";
export const SESSION_COOKIE = "stryde_admin_session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type { AdminSession };

function parseAllowedEmails(): Set<string> {
  const raw =
    process.env.ADMIN_ALLOWED_EMAILS ??
    process.env.NEXT_PUBLIC_ADMIN_ALLOWED_EMAILS ??
    "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.replace(/\r/g, "").trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getAllowedEmails(): string[] {
  return [...parseAllowedEmails()];
}

export function isEmailAllowed(email: string): boolean {
  const allowed = parseAllowedEmails();
  if (allowed.size === 0) {
    return process.env.NODE_ENV !== "production";
  }
  return allowed.has(email.trim().toLowerCase());
}

export function cookieOptions(maxAge = COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Attach session cookies to a route response (reliable in App Router). */
export function applyAdminCookies(
  response: NextResponse,
  tokens: TokenResponse,
  profile: PersonalInfoOut,
) {
  response.cookies.set(ACCESS_COOKIE, tokens.access_token, cookieOptions());
  if (tokens.refresh_token) {
    response.cookies.set(
      REFRESH_COOKIE,
      tokens.refresh_token,
      cookieOptions(60 * 60 * 24 * 30),
    );
  }
  response.cookies.set(
    SESSION_COOKIE,
    JSON.stringify({
      uid: profile.uid,
      email: profile.email,
      full_name: profile.full_name,
      profile_image_s3_key: profile.profile_image_s3_key,
    }),
    cookieOptions(),
  );
  return response;
}

export async function setAdminCookies(
  tokens: TokenResponse,
  profile: PersonalInfoOut,
) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.access_token, cookieOptions());
  if (tokens.refresh_token) {
    jar.set(REFRESH_COOKIE, tokens.refresh_token, cookieOptions(60 * 60 * 24 * 30));
  }
  jar.set(
    SESSION_COOKIE,
    JSON.stringify({
      uid: profile.uid,
      email: profile.email,
      full_name: profile.full_name,
      profile_image_s3_key: profile.profile_image_s3_key,
    }),
    cookieOptions(),
  );
}

export async function clearAdminCookies() {
  const jar = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) {
    jar.set(name, "", { ...cookieOptions(0), maxAge: 0 });
  }
}

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!raw || !token) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed.email || !isEmailAllowed(parsed.email)) return null;

    const me = await backendFetch<PersonalInfoOut>("/api/v1/profile/me", {
      token,
    });
    if (!isEmailAllowed(me.email)) return null;

    return {
      uid: me.uid,
      email: me.email,
      full_name: me.full_name,
      profile_image_s3_key: me.profile_image_s3_key,
    };
  } catch {
    return null;
  }
}

export async function adminBackendFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const session = await getAdminSession();
  const token = await getAccessToken();
  if (!session || !token) {
    throw new Error("Unauthorized");
  }
  return backendFetch<T>(path, { ...options, token });
}

/** Calls /api/v1/admin/* — requires platform admin on backend (ADMIN_ALLOWED_EMAILS). */
export async function adminPlatformFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const normalized = path.startsWith("/api/v1/admin")
    ? path
    : `/api/v1/admin${path.startsWith("/") ? path : `/${path}`}`;
  return adminBackendFetch<T>(normalized, options);
}
