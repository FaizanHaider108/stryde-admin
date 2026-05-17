import type { IconType } from "react-icons";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon: IconType;
};

export default function StatCard({ label, value, hint, icon: Icon }: Props) {
  return (
    <div className="admin-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-accent/15">
        <Icon className="h-5 w-5 text-green-accent" />
      </div>
      <p className="mt-4 text-sm text-brown/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-brown">{value}</p>
      {hint ? <p className="mt-1 text-xs text-brown/50">{hint}</p> : null}
    </div>
  );
}
