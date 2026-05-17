"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { FiSave } from "react-icons/fi";
import { parseJsonResponse } from "@/lib/client-api";
import { TARGET_DISTANCE_PRESETS } from "@/lib/plan-utils";
import type { PlanCreatePayload } from "@/types";

export default function PlanForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [targetDistance, setTargetDistance] = useState(TARGET_DISTANCE_PRESETS[2]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const keys = [1, 2, 3, 4]
      .map((i) => String(form.get(`key${i}`) ?? "").trim())
      .filter(Boolean);

    if (keys.length > 0 && keys.length < 3) {
      toast.error("Provide 3–4 key workout types, or leave them all empty.");
      setLoading(false);
      return;
    }

    const payload: PlanCreatePayload = {
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? "").trim() || undefined,
      target_distance: String(form.get("target_distance") ?? "").trim(),
      total_runs: Number(form.get("total_runs")),
      duration_weeks: Number(form.get("duration_weeks")),
      experience_level: String(form.get("experience_level") ?? ""),
      goal_type: String(form.get("goal_type") ?? ""),
      key_workout_types: keys.length ? keys : undefined,
    };

    if (!payload.name || !payload.target_distance) {
      toast.error("Plan name and target distance are required.");
      setLoading(false);
      return;
    }

    try {
      const plan = await parseJsonResponse<{ id: string }>(
        await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      toast.success("Plan created. Add weekly workouts next.");
      router.push(`/plans/${plan.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-3xl space-y-5 p-6">
      <p className="text-sm text-brown/65">
        Create the plan shell first, then add all 7 days per week with distance, pace, and duration
        so the app weekly table matches production plans.
      </p>

      <Field label="Plan name" name="name" required placeholder="12-Week Half Marathon Training Plan" />
      <Field label="Description" name="description" as="textarea" rows={4} />

      <div>
        <label htmlFor="target_distance" className="mb-1 block text-sm font-medium text-brown">
          Target distance
        </label>
        <select
          id="target_distance_preset"
          className="admin-input mb-2"
          value={targetDistance}
          onChange={(e) => setTargetDistance(e.target.value)}
        >
          {TARGET_DISTANCE_PRESETS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          id="target_distance"
          name="target_distance"
          required
          className="admin-input"
          value={targetDistance}
          onChange={(e) => setTargetDistance(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Duration (weeks)" name="duration_weeks" type="number" required min={1} />
        <Field
          label="Total runs"
          name="total_runs"
          type="number"
          required
          min={1}
          hint="Count of running days across the full plan"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Experience level"
          name="experience_level"
          options={["Beginner", "Intermediate", "Advanced", "Pro"]}
        />
        <SelectField label="Goal type" name="goal_type" options={["marathon", "race"]} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-brown">Key workout types (3–4)</p>
        <div className="grid gap-2">
          {[1, 2, 3, 4].map((i) => (
            <input
              key={i}
              name={`key${i}`}
              className="admin-input"
              placeholder={`Bullet ${i} — e.g. Progressive long runs`}
            />
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="admin-btn-primary inline-flex items-center gap-2">
        <FiSave size={16} />
        {loading ? "Creating…" : "Create plan & add workouts"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  as,
  rows,
  min,
  hint,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  as?: "textarea";
  rows?: number;
  min?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-brown">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea id={name} name={name} rows={rows ?? 3} className="admin-input" />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          min={min}
          className="admin-input"
        />
      )}
      {hint ? <p className="mt-1 text-xs text-brown/55">{hint}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-brown">
        {label}
      </label>
      <select id={name} name={name} required className="admin-input">
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}


