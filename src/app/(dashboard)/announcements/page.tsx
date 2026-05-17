import AnnouncementForm from "@/components/AnnouncementForm";
import PageHeader from "@/components/PageHeader";

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader
        title="Announcements"
        description="Send platform-wide notifications to all users."
      />
      <AnnouncementForm />
    </>
  );
}
