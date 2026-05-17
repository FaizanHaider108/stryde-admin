import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { adminBackendFetch } from "@/lib/admin-auth";
import { formatDate } from "@/lib/media";
import type { ClubOut } from "@/types";

export default async function ClubsPage() {
  const clubs = await adminBackendFetch<ClubOut[]>("/api/v1/clubs");

  return (
    <>
      <PageHeader
        title="Clubs"
        description={`${clubs.length} clubs on the platform including running groups and communities.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clubs.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.id}`}
            className="admin-card block p-5 transition hover:border-green-accent/40 hover:shadow-md"
          >
            <h2 className="font-medium text-brown">{club.name}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-brown/60">
              {club.description || "No description"}
            </p>
            <p className="mt-4 text-xs text-brown/50">
              {club.members?.length ?? 0} members · Created {formatDate(club.created_at)}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
