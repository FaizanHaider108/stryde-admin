import Link from "next/link";
import PostActions from "@/components/PostActions";
import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { formatDate } from "@/lib/media";
import type { PostResponse } from "@/types";

export default async function PostsPage() {
  const posts = await adminBackendFetch<PostResponse[]>("/api/v1/posts/");

  return (
    <>
      <PageHeader
        title="Content"
        description="Community feed posts. You can delete posts authored by your admin account."
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-light-brown/80 bg-light-brown/30 text-brown/70">
              <tr>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Caption</th>
                <th className="px-4 py-3 font-medium">Engagement</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-light-brown/40 last:border-0 hover:bg-light-brown/20"
                >
                  <td className="px-4 py-3">
                    {post.user ? (
                      <Link
                        href={`/users/${post.user.uid}`}
                        className="font-medium text-brown hover:underline"
                      >
                        {post.user.full_name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-brown/80">
                    {post.caption || "(no caption)"}
                  </td>
                  <td className="px-4 py-3 text-brown/60">
                    {post.likes_count} likes · {post.comments_count} comments
                  </td>
                  <td className="px-4 py-3 text-brown/60">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <PostActions postId={post.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
