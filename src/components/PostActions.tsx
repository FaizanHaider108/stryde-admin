"use client";

import AdminDeleteButton from "@/components/AdminDeleteButton";

type Props = { postId: string };

export default function PostActions({ postId }: Props) {
  return (
    <AdminDeleteButton
      label="Delete"
      confirmMessage="Delete this post for all users?"
      apiPath={`posts/${postId}`}
    />
  );
}
