export async function parseJsonResponse<T>(response: Response): Promise<T> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const message = extractErrorMessage(data, response.status);
    throw new Error(message);
  }

  return data as T;
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === "string" && record.error) return record.error;
    if (typeof record.detail === "string" && record.detail) return record.detail;
    if (typeof record.message === "string" && record.message) return record.message;
  }
  if (status === 401) return "Session expired. Please sign in again.";
  if (status === 404) return "Resource not found.";
  if (status >= 500) return "Server error. Try again in a moment.";
  return `Request failed (${status})`;
}
