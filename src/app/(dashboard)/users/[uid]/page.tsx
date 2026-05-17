import Link from "next/link";
import { notFound } from "next/navigation";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { formatDate, profileImageUrl } from "@/lib/media";
import type { PostResponse, ProfileWithSocialOut } from "@/types";

type Props = { params: Promise<{ uid: string }> };

export default async function UserDetailPage({ params }: Props) {
  const { uid } = await params;

  let profile: ProfileWithSocialOut;
  let posts: PostResponse[];

  try {
    [profile, posts] = await Promise.all([
      adminBackendFetch<ProfileWithSocialOut>(`/api/v1/profile/${uid}`),
      adminBackendFetch<PostResponse[]>(`/api/v1/profile/${uid}/posts`),
    ]);
  } catch {
    notFound();
  }

  const avatar = profileImageUrl(profile.profile_image_s3_key);

  return (
    <>
      <PageHeader
        title={profile.full_name}
        description={profile.email}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/users" className="admin-btn-secondary text-sm">
              ← All users
            </Link>
            <AdminDeleteButton
              label="Delete user"
              confirmMessage={`Permanently delete ${profile.full_name}?`}
              apiPath={`users/${uid}`}
              onSuccessRedirect="/users"
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card space-y-4 p-5 lg:col-span-1">
          <UserHeader profile={profile} avatar={avatar} />
          <dl className="space-y-2 text-sm">
            <DetailRow label="Auth" value={profile.auth_provider} />
            <DetailRow label="Location" value={profile.location ?? "—"} />
            <DetailRow label="Followers" value={String(profile.follower_count)} />
            <DetailRow label="Following" value={String(profile.following_count)} />
            <DetailRow label="DOB" value={profile.date_of_birth ?? "—"} />
          </dl>
        </div>

        <div className="admin-card p-5 lg:col-span-2">
          <h2 className="font-medium text-brown">Recent posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className="mt-4 text-sm text-brown/60">No posts yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-light-brown/50">
              {posts.slice(0, 10).map((post) => (
                <li key={post.id} className="py-3">
                  <p className="text-sm text-brown">{post.caption || "(no caption)"}</p>
                  <p className="mt-1 text-xs text-brown/50">
                    {formatDate(post.created_at)} · {post.likes_count} likes ·{" "}
                    {post.comments_count} comments
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/posts?user=${uid}`}
            className="mt-4 inline-block text-sm text-tan hover:underline"
          >
            View in content feed →
          </Link>
        </div>
      </div>
    </>
  );
}

function UserHeader({
  profile,
  avatar,
}: {
  profile: ProfileWithSocialOut;
  avatar: string | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-light-brown text-lg font-semibold text-brown">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          profile.full_name.charAt(0)
        )}
      </div>
      <div>
        <p className="font-medium text-brown">{profile.full_name}</p>
        <p className="text-sm capitalize text-brown/60">{profile.runner_type}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brown/60">{label}</dt>
      <dd className="text-right text-brown">{value}</dd>
    </div>
  );
}
