"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function AnnouncementForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/announcements/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });
      const data = (await response.json()) as {
        error?: string;
        sent_count?: number;
        message?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Broadcast failed.");
      toast.success(data.message ?? `Sent to ${data.sent_count ?? 0} users.`);
      setTitle("");
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Broadcast failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-xl space-y-4 p-6">
      <h2 className="font-medium text-brown">Platform-wide announcement</h2>
      <p className="text-sm text-brown/60">
        Sends an in-app notification (and push, if enabled) to every registered user.
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium text-brown">Title</label>
        <input
          className="admin-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brown">Message</label>
        <textarea
          className="admin-input min-h-[140px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={2000}
        />
      </div>
      <button type="submit" disabled={loading} className="admin-btn-primary">
        {loading ? "Sending…" : "Broadcast announcement"}
      </button>
    </form>
  );
}
