import Image from "next/image";
import type { PlanResponse } from "@/types";

const ICONS = {
  distance: "/plans-details/Distance pin (1).svg",
  runs: "/plans-details/run (3).svg",
  duration: "/plans-details/Clock (2).svg",
  level: "/plans-details/Star experience (2).svg",
};

export default function PlanStatsCards({ plan }: { plan: PlanResponse }) {
  const stats = [
    { icon: ICONS.distance, label: "Target distance", value: plan.target_distance },
    { icon: ICONS.runs, label: "Total runs", value: `${plan.total_runs} runs` },
    { icon: ICONS.duration, label: "Duration", value: `${plan.duration_weeks} weeks` },
    {
      icon: ICONS.level,
      label: "Experience",
      value: plan.experience_level ?? "—",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

function StatCard({
  stat,
}: {
  stat: { icon: string; label: string; value: string };
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-brown/20 bg-white p-4">
      <Image src={stat.icon} alt="" width={26} height={26} />
      <span className="text-xs font-medium text-brown/70">{stat.label}</span>
      <span className="font-righteous text-lg text-green-accent">{stat.value}</span>
    </div>
  );
}
