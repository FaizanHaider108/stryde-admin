"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiActivity,
  FiBell,
  FiCalendar,
  FiFlag,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiServer,
  FiUsers,
  FiX,
} from "react-icons/fi";
import type { AdminSession } from "@/types";
import { profileImageUrl } from "@/lib/media";

const NAV = [
  { href: "/", label: "Overview", icon: FiGrid },
  { href: "/users", label: "Users", icon: FiUsers },
  { href: "/community", label: "Community", icon: FiMessageCircle },
  { href: "/announcements", label: "Announcements", icon: FiBell },
  { href: "/clubs", label: "Clubs", icon: FiLayers },
  { href: "/posts", label: "Content", icon: FiActivity },
  { href: "/plans", label: "Training Plans", icon: FiCalendar },
  { href: "/races", label: "Races", icon: FiFlag },
  { href: "/system", label: "System", icon: FiServer },
];

type Props = {
  session: AdminSession;
  children: React.ReactNode;
};

export default function AdminShell({ session, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const avatar = profileImageUrl(session.profile_image_s3_key);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const sidebar = (
    <Sidebar
      pathname={pathname}
      session={session}
      avatar={avatar}
      onNavClick={() => setMobileOpen(false)}
      onLogout={handleLogout}
    />
  );

  return (
    <ShellLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} sidebar={sidebar}>
      {children}
    </ShellLayout>
  );
}

function Sidebar({
  pathname,
  session,
  avatar,
  onNavClick,
  onLogout,
}: {
  pathname: string;
  session: AdminSession;
  avatar: string | null;
  onNavClick: () => void;
  onLogout: () => void;
}) {
  return (
    <SidebarRoot>
      <SidebarHeader />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-green-accent/20 text-brown"
                  : "text-brown/70 hover:bg-light-brown/50 hover:text-brown"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <SidebarFooter session={session} avatar={avatar} onLogout={onLogout} />
    </SidebarRoot>
  );
}

function SidebarRoot({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col">{children}</div>;
}

function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 border-b border-light-brown/60 px-5 py-5">
      <Image src="/Logo.svg" alt="Stryde" width={120} height={36} priority />
      <span className="font-righteous text-xs uppercase tracking-widest text-tan">
        Admin
      </span>
    </div>
  );
}

function SidebarFooter({
  session,
  avatar,
  onLogout,
}: {
  session: AdminSession;
  avatar: string | null;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-light-brown/60 p-4">
      <UserRow session={session} avatar={avatar} />
      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-light-brown px-3 py-2 text-sm text-brown/80 transition hover:bg-light-brown/40"
      >
        <FiLogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

function UserRow({
  session,
  avatar,
}: {
  session: AdminSession;
  avatar: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <AvatarCircle avatar={avatar} name={session.full_name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brown">{session.full_name}</p>
        <p className="truncate text-xs text-brown/60">{session.email}</p>
      </div>
    </div>
  );
}

function AvatarCircle({ avatar, name }: { avatar: string | null; name: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-light-brown text-sm font-semibold text-brown">
      {avatar ? (
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

function ShellLayout({
  mobileOpen,
  setMobileOpen,
  sidebar,
  children,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-light-brown/60 bg-white lg:block">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-brown/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-brown hover:bg-light-brown/40"
            >
              <FiX className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-light-brown/60 bg-white px-4 py-3 lg:hidden">
          <Image src="/Logo.svg" alt="Stryde" width={100} height={30} />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-brown hover:bg-light-brown/40"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
