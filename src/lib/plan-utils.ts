import type { PlanWorkoutResponse } from "@/types";

export const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const WORKOUT_TYPES = [
  "easy",
  "tempo",
  "intervals",
  "long_run",
  "recovery",
  "rest",
  "off",
] as const;

export const RUN_WORKOUT_TYPES = new Set([
  "easy",
  "tempo",
  "intervals",
  "long_run",
  "recovery",
]);

export const TARGET_DISTANCE_PRESETS = [
  "5 km",
  "10 km",
  "21.1 km (Half Marathon)",
  "42.2 km (Full Marathon)",
  "50+ km (Ultra Marathon)",
];

export function isRunWorkout(type: string) {
  return RUN_WORKOUT_TYPES.has(type.toLowerCase().trim());
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return [hours, minutes, remaining]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export function parseDurationInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map((p) => Number(p));
    if (parts.some((n) => Number.isNaN(n))) return undefined;
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return undefined;
  }
  const minutes = Number(trimmed);
  if (Number.isNaN(minutes)) return undefined;
  return Math.round(minutes * 60);
}

export function formatPace(kmh: number | null | undefined): string {
  if (!kmh || kmh <= 0) return "—";
  return `${kmh.toFixed(1)} km/hr`;
}

export function formatDistance(km: number | null | undefined): string {
  if (!km || km <= 0) return "—";
  return `${km} km`;
}

export function durationFromDistanceAndPace(
  distanceKm: number,
  paceKmh: number,
): number {
  if (paceKmh <= 0) return 0;
  return Math.round((distanceKm / paceKmh) * 3600);
}

export function sortWorkouts(workouts: PlanWorkoutResponse[]): PlanWorkoutResponse[] {
  return [...workouts].sort((a, b) => {
    if (a.week_number !== b.week_number) return a.week_number - b.week_number;
    const dayA = DAY_ORDER.indexOf(a.day_name.toUpperCase() as (typeof DAY_ORDER)[number]);
    const dayB = DAY_ORDER.indexOf(b.day_name.toUpperCase() as (typeof DAY_ORDER)[number]);
    return (dayA === -1 ? 99 : dayA) - (dayB === -1 ? 99 : dayB);
  });
}

export function groupWorkoutsByWeek(
  workouts: PlanWorkoutResponse[],
): Record<number, PlanWorkoutResponse[]> {
  const sorted = sortWorkouts(workouts);
  return sorted.reduce<Record<number, PlanWorkoutResponse[]>>((acc, workout) => {
    const week = workout.week_number || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(workout);
    return acc;
  }, {});
}

export function runLabelForWorkout(
  workout: PlanWorkoutResponse,
  weekWorkouts: PlanWorkoutResponse[],
): string {
  const runTypes = weekWorkouts.filter((w) => isRunWorkout(w.workout_type));
  const index = runTypes.findIndex((w) => w.id === workout.id);
  const runNum = index >= 0 ? index + 1 : 1;
  const day = workout.day_name.charAt(0) + workout.day_name.slice(1).toLowerCase();
  return `Run ${runNum} - ${day}`;
}

export function countRunningWorkouts(workouts: PlanWorkoutResponse[]): number {
  return workouts.filter((w) => isRunWorkout(w.workout_type)).length;
}

export function validateWorkoutPayload(payload: {
  workout_type: string;
  target_distance_km?: number | null;
  target_duration_seconds?: number | null;
  target_pace_kmh?: number | null;
}): string | null {
  const type = payload.workout_type.toLowerCase().trim();
  if (!WORKOUT_TYPES.includes(type as (typeof WORKOUT_TYPES)[number])) {
    return `Workout type must be one of: ${WORKOUT_TYPES.join(", ")}`;
  }
  if (isRunWorkout(type)) {
    if (!payload.target_distance_km || payload.target_distance_km <= 0) {
      return "Running workouts require distance (km).";
    }
    if (!payload.target_pace_kmh || payload.target_pace_kmh <= 0) {
      return "Running workouts require target pace (km/h).";
    }
    if (!payload.target_duration_seconds || payload.target_duration_seconds <= 0) {
      return "Running workouts require duration (HH:MM:SS).";
    }
  }
  return null;
}

export function defaultWeekSkeleton(weekNumber: number): Omit<
  PlanWorkoutResponse,
  "id"
>[] {
  return DAY_ORDER.map((day) => ({
    id: "",
    week_number: weekNumber,
    day_name: day,
    workout_type: "off",
    title: "Rest day",
    description: "No scheduled run.",
    target_distance_km: null,
    target_duration_seconds: null,
    target_pace_kmh: null,
    variable_pace_data: null,
  }));
}
