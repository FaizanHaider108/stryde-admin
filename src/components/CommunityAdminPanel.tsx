"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

type Community = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

type Props = { initial: Community };

export default function CommunityAdminPanel({ initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial.image_url ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  async function saveCommunity(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          image_url: imageUrl || null,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save.");
      toast.success("Community updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function postToCommunity(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setPosting(true);
    try {
      const response = await fetch("/api/admin/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message.trim() }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not post.");
      toast.success("Message posted to community chat.");
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Post failed.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <>
      <form onSubmit={saveCommunity} className="admin-card space-y-4 p-5">
        <h2 className="font-medium text-brown">Community settings</h2>
        <p className="text-sm text-brown/60">
          The global Stryde community all new users join. ID: {initial.id}
        </p>
        <NameField name={name} setName={setName} />
        <DescriptionField description={description} setDescription={setDescription} />
        <ImageUrlField imageUrl={imageUrl} setImageUrl={setImageUrl} />
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Saving…" : "Save community"}
        </button>
      </form>

      <form onSubmit={postToCommunity} className="admin-card mt-6 space-y-4 p-5">
        <h2 className="font-medium text-brown">Community chat announcement</h2>
        <p className="text-sm text-brown/60">
          Posts a message in the official community club visible to all members.
        </p>
        <textarea
          className="admin-input min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write an announcement for the community…"
          required
        />
        <button type="submit" disabled={posting} className="admin-btn-primary">
          {posting ? "Posting…" : "Post to community"}
        </button>
      </form>
    </>
  );
}

function NameField({ name, setName }: { name: string; setName: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brown">Name</label>
      <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
    </div>
  );
}

function DescriptionField({
  description,
  setDescription,
}: {
  description: string;
  setDescription: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brown">Description</label>
      <textarea
        className="admin-input min-h-[80px]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>
  );
}

function ImageUrlField({
  imageUrl,
  setImageUrl,
}: {
  imageUrl: string;
  setImageUrl: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brown">Image URL</label>
      <input className="admin-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
    </div>
  );
}
