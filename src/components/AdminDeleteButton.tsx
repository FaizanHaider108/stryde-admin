"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  label: string;
  confirmMessage: string;
  apiPath: string;
  onSuccessRedirect?: string;
  variant?: "danger" | "secondary";
};

export default function AdminDeleteButton({
  label,
  confirmMessage,
  apiPath,
  onSuccessRedirect,
  variant = "danger",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/${apiPath}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Delete failed.");
      toast.success("Deleted.");
      if (onSuccessRedirect) {
        router.push(onSuccessRedirect);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  const className = variant === "danger" ? "admin-btn-danger text-sm" : "admin-btn-secondary text-sm";

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "…" : label}
    </button>
  );
}
