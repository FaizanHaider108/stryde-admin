export type AdminSession = {
  uid: string;
  email: string;
  full_name: string;
  profile_image_s3_key: string | null;
};

export type RunnerType =
  | "grinder"
  | "social stryder"
  | "goal crusher"
  | "flow chaser";

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
}

export interface PersonalInfoOut {
  uid: string;
  email: string;
  full_name: string;
  runner_type: RunnerType;
  auth_provider: string;
  profile_image_s3_key: string | null;
  date_of_birth: string | null;
  gender: string | null;
  location: string | null;
}

export interface InviteUserOut {
  uid: string;
  full_name: string;
  runner_type: RunnerType;
  profile_image_s3_key: string | null;
}

export interface ProfileWithSocialOut extends PersonalInfoOut {
  follower_count: number;
  following_count: number;
}

export interface ClubMember {
  user: {
    uid: string;
    full_name: string;
    profile_image_s3_key: string | null;
  };
  role: string;
  joined_at: string;
}

export interface ClubOut {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_community?: boolean;
  created_at: string;
  members: ClubMember[];
}

export interface PostResponse {
  id: string;
  user_id: string;
  caption: string | null;
  created_at: string | null;
  user: {
    uid: string;
    full_name: string;
    profile_image_s3_key: string | null;
  } | null;
  images: string[];
  likes_count: number;
  comments_count: number;
}

export interface PlanWorkoutResponse {
  id: string;
  week_number: number;
  day_name: string;
  workout_type: string;
  title: string | null;
  description: string | null;
  target_distance_km: number | null;
  target_duration_seconds: number | null;
  target_pace_kmh: number | null;
  variable_pace_data: Record<string, unknown> | null;
}

export interface PlanResponse {
  id: string;
  name: string;
  description: string | null;
  target_distance: string;
  total_runs: number;
  duration_weeks: number;
  experience_level: string | null;
  goal_type: string | null;
  key_workout_types?: string[];
  is_custom_ai?: boolean;
  workouts?: PlanWorkoutResponse[];
}

export interface PlanCreatePayload {
  name: string;
  description?: string;
  target_distance: string;
  total_runs: number;
  duration_weeks: number;
  experience_level: string;
  goal_type: string;
  key_workout_types?: string[];
}

export interface PlanUpdatePayload {
  name?: string;
  description?: string;
  target_distance?: string;
  total_runs?: number;
  duration_weeks?: number;
  experience_level?: string;
  goal_type?: string;
  key_workout_types?: string[];
}

export interface PlanWorkoutCreatePayload {
  week_number: number;
  day_name: string;
  workout_type: string;
  title?: string;
  description?: string;
  target_distance_km?: number | null;
  target_duration_seconds?: number | null;
  target_pace_kmh?: number | null;
  variable_pace_data?: Record<string, unknown> | null;
}

export type PlanWorkoutUpdatePayload = Partial<PlanWorkoutCreatePayload>;

export interface RaceResponse {
  id: string;
  name: string;
  start_time: string;
  location_text: string;
  distance_km: number;
  distance_label: string;
}

export interface ExternalRaceResult {
  external_id?: string;
  name?: string;
  start_time?: string;
  location_text?: string;
  distance_km?: number;
  distance_label?: string;
}

export interface BackendHealth {
  status: string;
}

export interface SubscriptionStatus {
  is_active: boolean;
  status: string;
  current_period_end: string | null;
}
