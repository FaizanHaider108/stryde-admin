"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { FiUserPlus } from "react-icons/fi";
import { parseJsonResponse } from "@/lib/client-api";
import type { RunnerType } from "@/types";

const RUNNER_TYPES: { value: RunnerType; label: string }[] = [
  { value: "grinder", label: "Grinder" },
  { value: "social stryder", label: "Social Stryder" },
  { value: "goal crusher", label: "Goal Crusher" },
  { value: "flow chaser", label: "Flow Chaser" },
];

type CreatedUser = {
  uid: string;
  full_name: string;
  email: string;
  runner_type: RunnerType;
};

export default function CreateUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [runnerType, setRunnerType] = useState<RunnerType>("grinder");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const full_name = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm_password") ?? "");

    if (!full_name || !email || !password || !confirm) {
      toast.error("Please complete all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const user = await parseJsonResponse<CreatedUser>(
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name,
            email,
            password,
            runner_type: runnerType,
          }),
        }),
      );
      toast.success(`Account created for ${user.full_name}.`);
      formEl.reset();
      setRunnerType("grinder");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-4 p-5">
      <div>
        <h2 className="font-medium text-brown">Create user</h2>
        <p className="text-xs text-brown/60">
          Same as app sign-up: email/password account, auto-joined to community.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="full_name" required placeholder="Jane Runner" />
        <Field label="Email" name="email" type="email" required placeholder="runner@example.com" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" name="password" type="password" required minLength={8} />
        <Field
          label="Confirm password"
          name="confirm_password"
          type="password"
          required
          minLength={8}
        />
      </div>

      <div>
        <label htmlFor="runner_type" className="mb-1 block text-sm font-medium text-brown">
          Runner type
        </label>
        <select
          id="runner_type"
          className="admin-input"
          value={runnerType}
          onChange={(e) => setRunnerType(e.target.value as RunnerType)}
        >
          {RUNNER_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="admin-btn-primary inline-flex items-center gap-2"
      >
        <FiUserPlus size={16} />
        {loading ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-brown">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="admin-input"
        autoComplete={type === "password" ? "new-password" : undefined}
      />
    </div>
  );
}

