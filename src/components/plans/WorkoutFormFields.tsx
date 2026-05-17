"use client";

import {
  DAY_ORDER,
  WORKOUT_TYPES,
  durationFromDistanceAndPace,
  formatDuration,
  isRunWorkout,
  parseDurationInput,
} from "@/lib/plan-utils";
import type { PlanWorkoutCreatePayload } from "@/types";
import { useEffect, useState } from "react";

export type WorkoutFormValues = PlanWorkoutCreatePayload;

type Props = {
  values: WorkoutFormValues;
  onChange: (values: WorkoutFormValues) => void;
  idPrefix?: string;
};

export default function WorkoutFormFields({ values, onChange, idPrefix = "w" }: Props) {
  const [durationText, setDurationText] = useState(
    values.target_duration_seconds
      ? formatDuration(values.target_duration_seconds)
      : "",
  );
  const [variablePaceJson, setVariablePaceJson] = useState(
    values.variable_pace_data ? JSON.stringify(values.variable_pace_data, null, 2) : "",
  );
  const running = isRunWorkout(values.workout_type);

  useEffect(() => {
    if (
      running &&
      values.target_distance_km &&
      values.target_pace_kmh &&
      !values.target_duration_seconds
    ) {
      const seconds = durationFromDistanceAndPace(
        values.target_distance_km,
        values.target_pace_kmh,
      );
      onChange({ ...values, target_duration_seconds: seconds });
      setDurationText(formatDuration(seconds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.target_distance_km, values.target_pace_kmh, values.workout_type]);

  function patch(partial: Partial<WorkoutFormValues>) {
    const next = { ...values, ...partial };
    if (partial.workout_type && !isRunWorkout(partial.workout_type)) {
      next.target_distance_km = null;
      next.target_duration_seconds = null;
      next.target_pace_kmh = null;
      setDurationText("");
    }
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Week" id={`${idPrefix}-week`}>
          <input
            id={`${idPrefix}-week`}
            type="number"
            min={1}
            className="admin-input"
            value={values.week_number}
            onChange={(e) => patch({ week_number: Number(e.target.value) })}
          />
        </Field>
        <Field label="Day" id={`${idPrefix}-day`}>
          <select
            id={`${idPrefix}-day`}
            className="admin-input"
            value={values.day_name}
            onChange={(e) => patch({ day_name: e.target.value })}
          >
            {DAY_ORDER.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Workout type" id={`${idPrefix}-type`}>
        <select
          id={`${idPrefix}-type`}
          className="admin-input"
          value={values.workout_type}
          onChange={(e) => patch({ workout_type: e.target.value })}
        >
          {WORKOUT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title" id={`${idPrefix}-title`}>
        <input
          id={`${idPrefix}-title`}
          className="admin-input"
          value={values.title ?? ""}
          onChange={(e) => patch({ title: e.target.value || undefined })}
          placeholder="e.g. Easy Run - 5 km"
        />
      </Field>

      <Field label="Description" id={`${idPrefix}-desc`}>
        <textarea
          id={`${idPrefix}-desc`}
          rows={3}
          className="admin-input"
          value={values.description ?? ""}
          onChange={(e) => patch({ description: e.target.value || undefined })}
          placeholder="Full workout instructions shown in the app weekly table"
        />
      </Field>

      {running ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Distance (km)" id={`${idPrefix}-dist`}>
            <input
              id={`${idPrefix}-dist`}
              type="number"
              step="0.1"
              min={0}
              className="admin-input"
              value={values.target_distance_km ?? ""}
              onChange={(e) =>
                patch({
                  target_distance_km: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Field>
          <Field label="Pace (km/h)" id={`${idPrefix}-pace`}>
            <input
              id={`${idPrefix}-pace`}
              type="number"
              step="0.1"
              min={0}
              className="admin-input"
              value={values.target_pace_kmh ?? ""}
              onChange={(e) =>
                patch({
                  target_pace_kmh: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Field>
          <Field label="Duration (HH:MM:SS)" id={`${idPrefix}-dur`}>
            <input
              id={`${idPrefix}-dur`}
              className="admin-input"
              placeholder="00:35:00"
              value={durationText}
              onChange={(e) => {
                setDurationText(e.target.value);
                const seconds = parseDurationInput(e.target.value);
                patch({ target_duration_seconds: seconds });
              }}
            />
          </Field>
        </div>
      ) : (
        <p className="rounded-lg bg-light-brown/40 px-3 py-2 text-xs text-brown/65">
          Rest and off days do not need distance, pace, or duration.
        </p>
      )}

      <details className="rounded-lg border border-light-brown/80 bg-light-brown/20 px-3 py-2">
        <summary className="cursor-pointer text-sm font-medium text-brown">
          Variable pace (advanced JSON)
        </summary>
        <textarea
          rows={4}
          className="admin-input mt-2 font-mono text-xs"
          placeholder='{"segments":[{"distance_km":1,"pace_kmh":8}]}'
          value={variablePaceJson}
          onChange={(e) => {
            setVariablePaceJson(e.target.value);
            if (!e.target.value.trim()) {
              patch({ variable_pace_data: null });
              return;
            }
            try {
              patch({
                variable_pace_data: JSON.parse(e.target.value) as Record<string, unknown>,
              });
            } catch {
              /* wait for valid JSON */
            }
          }}
        />
      </details>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-brown">
        {label}
      </label>
      {children}
    </div>
  );
}
