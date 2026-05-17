"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  formatDistance,
  formatDuration,
  formatPace,
  groupWorkoutsByWeek,
  runLabelForWorkout,
} from "@/lib/plan-utils";
import type { PlanResponse, PlanWorkoutResponse } from "@/types";

type Props = {
  plan: PlanResponse;
  onEdit: (workout: PlanWorkoutResponse) => void;
  onDelete: (workout: PlanWorkoutResponse) => void;
};

export default function PlanWeeklySchedule({ plan, onEdit, onDelete }: Props) {
  const workouts = plan.workouts ?? [];
  const byWeek = useMemo(() => groupWorkoutsByWeek(workouts), [workouts]);
  const weeks = useMemo(() => {
    const max = plan.duration_weeks || 1;
    const keys = new Set([
      ...Object.keys(byWeek).map(Number),
      ...Array.from({ length: max }, (_, i) => i + 1),
    ]);
    return [...keys].sort((a, b) => a - b);
  }, [byWeek, plan.duration_weeks]);

  const [activeWeek, setActiveWeek] = useState(weeks[0] ?? 1);
  const weekWorkouts = byWeek[activeWeek] ?? [];
  const expectedDays = plan.duration_weeks * 7;
  const complete = workouts.length >= expectedDays;

  return (
    <section className="admin-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-light-brown/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-medium text-brown">Weekly schedule</h2>
          <p className="text-xs text-brown/60">
            {workouts.length} / {expectedDays} days filled
            {!complete && " — add all 7 days per week for a complete plan"}
          </p>
        </div>
        {!complete && (
          <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
            Incomplete
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto px-5 py-3">
        {weeks.map((week) => (
          <button
            key={week}
            type="button"
            onClick={() => setActiveWeek(week)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase transition ${
              activeWeek === week
                ? "bg-brown text-light-brown"
                : "bg-light-brown/50 text-brown/70 hover:bg-light-brown"
            }`}
          >
            <Image src="/Profile_Icons/CalendarIcon.svg" alt="" width={14} height={14} />
            Week {week}
          </button>
        ))}
      </div>

      {weekWorkouts.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-brown/55">
          No workouts for week {activeWeek}. Use &quot;Add full week&quot; or add a single day below.
        </p>
      ) : (
        <div className="overflow-x-auto bg-[#DDDDDD]/80">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#DDDDDD]">
                {["Run name", "Description", "Target pace", "Distance", "Duration", ""].map((h) => (
                  <th
                    key={h}
                    className="border border-brown/30 p-3 text-left text-xs font-semibold text-brown"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekWorkouts.map((workout, index) => (
                <tr
                  key={workout.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]"}
                >
                  <td className="border border-brown/20 bg-[#DDDDDD]/60 p-3 font-semibold text-brown">
                    {runLabelForWorkout(workout, weekWorkouts)}
                  </td>
                  <td className="border border-brown/20 p-3 text-brown/85">
                    {workout.description || workout.title || workout.workout_type}
                  </td>
                  <td className="border border-brown/20 p-3">
                    {workout.variable_pace_data ? (
                      <span className="text-xs text-tan">Variable pace</span>
                    ) : (
                      formatPace(workout.target_pace_kmh)
                    )}
                  </td>
                  <td className="border border-brown/20 p-3 font-medium">
                    {formatDistance(workout.target_distance_km)}
                  </td>
                  <td className="border border-brown/20 p-3 font-medium">
                    {formatDuration(workout.target_duration_seconds)}
                  </td>
                  <td className="border border-brown/20 p-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(workout)}
                        className="rounded-lg p-2 text-brown hover:bg-light-brown"
                        title="Edit workout"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(workout)}
                        className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                        title="Delete workout"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
