const S3_BASE =
  process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ??
  "https://stryde101s3.s3.ap-south-1.amazonaws.com";

export function profileImageUrl(s3Key: string | null | undefined): string | null {
  if (!s3Key) return null;
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) return s3Key;
  return `${S3_BASE.replace(/\/+$/, "")}/${s3Key.replace(/^\/+/, "")}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
