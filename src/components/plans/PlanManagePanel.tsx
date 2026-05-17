"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiSave, FiX } from "react-icons/fi";
import { parseJsonResponse } from "@/lib/client-api";
import {
  DAY_ORDER,
  countRunningWorkouts,
  defaultWeekSkeleton,
  validateWorkoutPayload,
} from "@/lib/plan-utils";
import type {
  PlanResponse,
  PlanUpdatePayload,
  PlanWorkoutCreatePayload,
  PlanWorkoutResponse,
} from "@/types";
import PlanStatsCards from "./PlanStatsCards";
import PlanWeeklySchedule from "./PlanWeeklySchedule";
import WorkoutFormFields, { type WorkoutFormValues } from "./WorkoutFormFields";

type Props = { initialPlan: PlanResponse };

const emptyWorkout = (week: number, day: string): WorkoutFormValues => ({
  week_number: week,
  day_name: day,
  workout_type: "off",
  title: "Rest day",
  description: "No scheduled run.",
  target_distance_km: null,
  target_duration_seconds: null,
  target_pace_kmh: null,
  variable_pace_data: null,
});

export default function PlanManagePanel({ initialPlan }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [metaOpen, setMetaOpen] = useState(false);
  const [meta, setMeta] = useState({
    name: plan.name,
    description: plan.description ?? "",
    target_distance: plan.target_distance,
    total_runs: plan.total_runs,
    duration_weeks: plan.duration_weeks,
    experience_level: plan.experience_level ?? "Intermediate",
    goal_type: plan.goal_type ?? "marathon",
    key1: plan.key_workout_types?.[0] ?? "",
    key2: plan.key_workout_types?.[1] ?? "",
    key3: plan.key_workout_types?.[2] ?? "",
    key4: plan.key_workout_types?.[3] ?? "",
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const [editorMode, setEditorMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [workoutForm, setWorkoutForm] = useState<WorkoutFormValues>(
    emptyWorkout(1, DAY_ORDER[0]),
  );
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [scaffoldingWeek, setScaffoldingWeek] = useState(false);

  const workouts = plan.workouts ?? [];
  const runCount = useMemo(() => countRunningWorkouts(workouts), [workouts]);

  async function saveMeta() {
    const keys = [meta.key1, meta.key2, meta.key3, meta.key4].map((k) => k.trim()).filter(Boolean);
    if (keys.length > 0 && keys.length < 3) {
      toast.error("Add 3–4 key workout types, or leave all empty.");
      return;
    }

    setSavingMeta(true);
    try {
      const payload: PlanUpdatePayload = {
        name: meta.name.trim(),
        description: meta.description.trim() || undefined,
        target_distance: meta.target_distance.trim(),
        total_runs: Number(meta.total_runs),
        duration_weeks: Number(meta.duration_weeks),
        experience_level: meta.experience_level,
        goal_type: meta.goal_type,
        key_workout_types: keys.length ? keys : [],
      };
      const updated = await parseJsonResponse<PlanResponse>(
        await fetch(`/api/admin/plans/${plan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      setPlan((p) => ({ ...p, ...updated, workouts: p.workouts }));
      toast.success("Plan details saved.");
      setMetaOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save plan.");
    } finally {
      setSavingMeta(false);
    }
  }

  function openAddWorkout(week?: number) {
    setEditorMode("add");
    setEditingId(null);
    setWorkoutForm(emptyWorkout(week ?? 1, DAY_ORDER[0]));
  }

  function openEditWorkout(workout: PlanWorkoutResponse) {
    setEditorMode("edit");
    setEditingId(workout.id);
    setWorkoutForm({
      week_number: workout.week_number,
      day_name: workout.day_name.toUpperCase(),
      workout_type: workout.workout_type,
      title: workout.title ?? undefined,
      description: workout.description ?? undefined,
      target_distance_km: workout.target_distance_km,
      target_duration_seconds: workout.target_duration_seconds,
      target_pace_kmh: workout.target_pace_kmh,
      variable_pace_data: workout.variable_pace_data,
    });
  }

  async function submitWorkout() {
    const validation = validateWorkoutPayload(workoutForm);
    if (validation) {
      toast.error(validation);
      return;
    }

    setSavingWorkout(true);
    try {
      if (editorMode === "edit" && editingId) {
        const updated = await parseJsonResponse<PlanWorkoutResponse>(
          await fetch(`/api/admin/plans/${plan.id}/workouts/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutForm),
          }),
        );
        setPlan((p) => ({
          ...p,
          workouts: (p.workouts ?? []).map((w) => (w.id === editingId ? updated : w)),
        }));
        toast.success("Workout updated.");
      } else {
        const created = await parseJsonResponse<PlanWorkoutResponse>(
          await fetch(`/api/admin/plans/${plan.id}/workouts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutForm),
          }),
        );
        setPlan((p) => ({
          ...p,
          workouts: [...(p.workouts ?? []), created],
        }));
        toast.success("Workout added.");
      }
      setEditorMode(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save workout.");
    } finally {
      setSavingWorkout(false);
    }
  }

  async function deleteWorkout(workout: PlanWorkoutResponse) {
    if (!confirm(`Delete ${workout.day_name} (week ${workout.week_number})?`)) return;
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/workouts/${workout.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Delete failed.");
      }
      setPlan((p) => ({
        ...p,
        workouts: (p.workouts ?? []).filter((w) => w.id !== workout.id),
      }));
      toast.success("Workout removed.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete.");
    }
  }

  async function scaffoldWeek() {
    const week = workoutForm.week_number || 1;
    const existing = new Set(
      (plan.workouts ?? [])
        .filter((w) => w.week_number === week)
        .map((w) => w.day_name.toUpperCase()),
    );
    const toCreate = defaultWeekSkeleton(week).filter(
      (w) => !existing.has(w.day_name),
    );
    if (!toCreate.length) {
      toast.error(`Week ${week} already has all 7 days.`);
      return;
    }

    setScaffoldingWeek(true);
    let added = 0;
    const created: PlanWorkoutResponse[] = [];
    try {
      for (const skeleton of toCreate) {
        const row = await parseJsonResponse<PlanWorkoutResponse>(
          await fetch(`/api/admin/plans/${plan.id}/workouts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(skeleton),
          }),
        );
        created.push(row);
        added += 1;
      }
      setPlan((p) => ({ ...p, workouts: [...(p.workouts ?? []), ...created] }));
      toast.success(`Added ${added} day(s) for week ${week}.`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Stopped after ${added} day(s). Fix errors and retry.`,
      );
    } finally {
      setScaffoldingWeek(false);
    }
  }

  return (
    <div className="space-y-6">
      <PlanStatsCards plan={plan} />

      {plan.key_workout_types && plan.key_workout_types.length > 0 && (
        <div className="admin-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-brown">Key workout types</h2>
          <ul className="space-y-2">
            {plan.key_workout_types.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-brown">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brown" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="admin-card p-5">
        <button
          type="button"
          onClick={() => setMetaOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-medium text-brown">Plan details & key workouts</span>
          <span className="text-xs text-brown/50">{metaOpen ? "Hide" : "Edit"}</span>
        </button>

        {metaOpen && (
          <div className="mt-4 space-y-4 border-t border-light-brown/60 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetaField label="Plan name">
                <input
                  className="admin-input"
                  value={meta.name}
                  onChange={(e) => setMeta({ ...meta, name: e.target.value })}
                />
              </MetaField>
              <MetaField label="Target distance">
                <input
                  className="admin-input"
                  value={meta.target_distance}
                  onChange={(e) => setMeta({ ...meta, target_distance: e.target.value })}
                />
              </MetaField>
            </div>
            <MetaField label="Description">
              <textarea
                rows={3}
                className="admin-input"
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              />
            </MetaField>
            <div className="grid gap-4 sm:grid-cols-3">
              <MetaField label="Weeks">
                <input
                  type="number"
                  min={1}
                  className="admin-input"
                  value={meta.duration_weeks}
                  onChange={(e) =>
                    setMeta({ ...meta, duration_weeks: Number(e.target.value) })
                  }
                />
              </MetaField>
              <MetaField label="Total runs">
                <input
                  type="number"
                  min={1}
                  className="admin-input"
                  value={meta.total_runs}
                  onChange={(e) => setMeta({ ...meta, total_runs: Number(e.target.value) })}
                />
              </MetaField>
              <MetaField label="Running workouts in plan">
                <p className="admin-input bg-light-brown/30 text-brown/70">
                  {runCount} (auto-counted)
                </p>
              </MetaField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetaField label="Experience">
                <select
                  className="admin-input"
                  value={meta.experience_level}
                  onChange={(e) => setMeta({ ...meta, experience_level: e.target.value })}
                >
                  {["Beginner", "Intermediate", "Advanced", "Pro"].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </MetaField>
              <MetaField label="Goal type">
                <select
                  className="admin-input"
                  value={meta.goal_type}
                  onChange={(e) => setMeta({ ...meta, goal_type: e.target.value })}
                >
                  <option value="marathon">marathon</option>
                  <option value="race">race</option>
                </select>
              </MetaField>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-brown">
                Key workout types (3–4 bullets, shown on plan detail in app)
              </p>
              <div className="grid gap-2">
                {(["key1", "key2", "key3", "key4"] as const).map((k, i) => (
                  <input
                    key={k}
                    className="admin-input"
                    placeholder={`Bullet ${i + 1}`}
                    value={meta[k]}
                    onChange={(e) => setMeta({ ...meta, [k]: e.target.value })}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={savingMeta}
              onClick={saveMeta}
              className="admin-btn-primary inline-flex items-center gap-2"
            >
              <FiSave size={16} />
              {savingMeta ? "Saving…" : "Save plan details"}
            </button>
          </div>
        )}
      </div>

      <PlanWeeklySchedule plan={plan} onEdit={openEditWorkout} onDelete={deleteWorkout} />

      <div className="admin-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium text-brown">
            {editorMode === "edit" ? "Edit workout" : "Add workout"}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => scaffoldWeek()}
              disabled={scaffoldingWeek}
              className="admin-btn-secondary inline-flex items-center gap-1 text-sm"
            >
              <FiPlus size={14} />
              {scaffoldingWeek ? "Adding week…" : "Add full week (7 days)"}
            </button>
            {editorMode && (
              <button
                type="button"
                onClick={() => setEditorMode(null)}
                className="admin-btn-secondary inline-flex items-center gap-1 text-sm"
              >
                <FiX size={14} /> Cancel
              </button>
            )}
          </div>
        </div>

        {(editorMode === null && (
          <button
            type="button"
            onClick={() => openAddWorkout(1)}
            className="admin-btn-primary inline-flex items-center gap-2 text-sm"
          >
            <FiPlus size={16} /> Add single day
          </button>
        )) ||
          (editorMode && (
            <>
              <WorkoutFormFields values={workoutForm} onChange={setWorkoutForm} />
              <button
                type="button"
                disabled={savingWorkout}
                onClick={submitWorkout}
                className="admin-btn-primary mt-4 inline-flex items-center gap-2"
              >
                <FiSave size={16} />
                {savingWorkout ? "Saving…" : editorMode === "edit" ? "Update workout" : "Add workout"}
              </button>
            </>
          ))}
      </div>
    </div>
  );
}

function MetaField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brown">{label}</label>
      {children}
    </div>
  );
}

