"use client";

import Link from "next/link";
import AdminDeleteButton from "@/components/AdminDeleteButton";

type Props = { uid: string; name: string };

export default function UserRowActions({ uid, name }: Props) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Link href={`/users/${uid}`} className="text-sm text-tan hover:underline">
        View
      </Link>
      <AdminDeleteButton
        label="Delete"
        confirmMessage={`Permanently delete user "${name}"? This cannot be undone.`}
        apiPath={`users/${uid}`}
        onSuccessRedirect="/users"
      />
    </div>
  );
}
