export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export const API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function resolveErrorDetail(status: number, payload: unknown): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.message === "string") return record.message;
  }
  return `Request failed (${status})`;
}

export function toApiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

const DEFAULT_TIMEOUT_MS = 60_000;

export async function backendFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    token?: string;
    body?: unknown;
    signal?: AbortSignal;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const { method = "GET", token, body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const timeoutSignal =
    typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(timeoutMs)
      : undefined;
  const combinedSignal =
    signal && timeoutSignal
      ? AbortSignal.any([signal, timeoutSignal])
      : signal ?? timeoutSignal;

  let response: Response;
  try {
    response = await fetch(toApiUrl(path), {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: combinedSignal,
    cache: "no-store",
  });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(
        "Backend request timed out. If using Render, the server may be waking up — try again in a minute or use a local API_BASE_URL.",
        504,
      );
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Could not reach the backend. Check API_BASE_URL in .env.local and that the API is running.",
      0,
      error,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  let payload: unknown;

  if (isJson) {
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      resolveErrorDetail(response.status, payload),
      response.status,
      payload,
    );
  }

  if (response.status === 204) return undefined as T;
  if (isJson) return payload as T;
  return undefined as T;
}
