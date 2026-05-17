import Link from "next/link";
import { FiActivity, FiCalendar, FiLayers, FiUsers } from "react-icons/fi";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { adminBackendFetch } from "@/lib/admin-auth";
import type {
  BackendHealth,
  ClubOut,
  InviteUserOut,
  PlanResponse,
  PostResponse,
} from "@/types";

async function loadOverview() {
  const [health, users, clubs, posts, plans] = await Promise.all([
    adminBackendFetch<BackendHealth>("/api/v1/health").catch(() => ({ status: "error" })),
    adminBackendFetch<InviteUserOut[]>("/api/v1/profile/users").catch(() => []),
    adminBackendFetch<ClubOut[]>("/api/v1/clubs").catch(() => []),
    adminBackendFetch<PostResponse[]>("/api/v1/posts/").catch(() => []),
    adminBackendFetch<PlanResponse[]>("/api/v1/plans/").catch(() => []),
  ]);

  const runnerTypes = users.reduce<Record<string, number>>((acc, user) => {
    const key = user.runner_type ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const topRunnerType =
    Object.entries(runnerTypes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return {
    health,
    counts: {
      users: users.length,
      clubs: clubs.length,
      posts: posts.length,
      plans: plans.length,
    },
    topRunnerType,
  };
}

function InsightCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card p-5">
      <h2 className="font-medium text-brown">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default async function OverviewPage() {
  const { health, counts, topRunnerType } = await loadOverview();
  const backendOk = health.status === "ok";

  const quickLinks = [
    { href: "/community", label: "Manage global community" },
    { href: "/announcements", label: "Broadcast platform announcement" },
    { href: "/plans/new", label: "Create training plan template" },
    { href: "/posts", label: "Moderate community feed" },
    { href: "/clubs", label: "Manage & delete clubs" },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Platform snapshot from the live Stryde API. Metrics refresh on each visit."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered users" value={counts.users} icon={FiUsers} />
        <StatCard label="Clubs" value={counts.clubs} icon={FiLayers} />
        <StatCard label="Feed posts" value={counts.posts} icon={FiActivity} />
        <StatCard
          label="Training plans"
          value={counts.plans}
          icon={FiCalendar}
          hint="Template + AI plans in catalog"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <InsightCard title="Backend health">
          <p className="text-sm text-brown/70">
            API status:{" "}
            <span
              className={`font-medium ${backendOk ? "text-green-accent" : "text-red-600"}`}
            >
              {backendOk ? "Healthy" : "Unavailable"}
            </span>
          </p>
          <Link href="/system" className="mt-3 inline-block text-sm text-tan hover:underline">
            View system details →
          </Link>
        </InsightCard>

        <InsightCard title="Community mix">
          <p className="text-sm text-brown/70">
            Most common runner type:{" "}
            <span className="font-medium capitalize text-brown">{topRunnerType}</span>
          </p>
          <Link href="/users" className="mt-3 inline-block text-sm text-tan hover:underline">
            Browse all users →
          </Link>
        </InsightCard>
      </div>

      <QuickLinksCard quickLinks={quickLinks} />
    </>
  );
}

function QuickLinksCard({ quickLinks }: { quickLinks: { href: string; label: string }[] }) {
  return (
    <div className="admin-card mt-6 p-5">
      <h2 className="font-medium text-brown">Quick actions</h2>
      <ul className="mt-3 space-y-2">
        {quickLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-tan hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
