import Link from "next/link";
import { notFound } from "next/navigation";
import ClubActions from "@/components/ClubActions";
import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { formatDate, profileImageUrl } from "@/lib/media";
import type { ClubMember, ClubOut } from "@/types";

type Props = { params: Promise<{ id: string }> };

export default async function ClubDetailPage({ params }: Props) {
  const { id } = await params;

  let club: ClubOut;
  try {
    club = await adminBackendFetch<ClubOut>(`/api/v1/clubs/${id}`);
  } catch {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={club.name}
        description={club.description ?? "Running club"}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/clubs" className="admin-btn-secondary text-sm">
              ← All clubs
            </Link>
            <ClubActions
              clubId={club.id}
              clubName={club.name}
              isCommunity={club.is_community}
            />
          </div>
        }
      />

      <div className="admin-card overflow-hidden">
        <div className="border-b border-light-brown/60 px-5 py-4">
          <p className="text-sm text-brown/60">
            Created {formatDate(club.created_at)} · {club.members?.length ?? 0} members
          </p>
        </div>
        <MemberTable members={club.members ?? []} />
      </div>
    </>
  );
}

function MemberTable({ members }: { members: ClubMember[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-light-brown/80 bg-light-brown/30 text-brown/70">
          <tr>
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const avatar = profileImageUrl(member.user.profile_image_s3_key);
            return (
              <tr
                key={member.user.uid}
                className="border-b border-light-brown/40 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-light-brown text-xs font-semibold">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        member.user.full_name.charAt(0)
                      )}
                    </div>
                    <Link
                      href={`/users/${member.user.uid}`}
                      className="font-medium text-brown hover:underline"
                    >
                      {member.user.full_name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-brown/70">{member.role}</td>
                <td className="px-4 py-3 text-brown/60">{formatDate(member.joined_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
