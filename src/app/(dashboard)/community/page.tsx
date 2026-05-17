import AdminAccessAlert from "@/components/AdminAccessAlert";
import CommunityAdminPanel from "@/components/CommunityAdminPanel";
import PageHeader from "@/components/PageHeader";
import { adminPlatformFetch } from "@/lib/admin-auth";
import { ApiError } from "@/lib/api";
import type { ClubOut } from "@/types";

export default async function CommunityPage() {
  let community: ClubOut | null = null;
  let error: string | null = null;

  try {
    community = await adminPlatformFetch<ClubOut>("/community");
  } catch (e) {
    error =
      e instanceof ApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Could not load community.";
  }

  const adminHint =
    "Add the same email to ADMIN_ALLOWED_EMAILS in website-stryde-backend/.env, then restart uvicorn.";

  return (
    <>
      <PageHeader
        title="Community"
        description="Manage the global Stryde community and post chat announcements."
      />

      {error ? (
        <AdminAccessAlert
          title="Community unavailable"
          message={error}
          hint={
            error.includes("Platform admin") || error.includes("403")
              ? adminHint
              : "Check API_BASE_URL and that the backend is running."
          }
        />
      ) : community ? (
        <CommunityAdminPanel
          initial={{
            id: String(community.id),
            name: community.name,
            description: community.description,
            image_url: community.image_url,
          }}
        />
      ) : null}
    </>
  );
}
