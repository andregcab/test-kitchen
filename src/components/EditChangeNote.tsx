"use client";

import { useState } from "react";

export default function EditChangeNote({
  recipeId,
  versionNumber,
  initial,
}: {
  recipeId: string;
  versionNumber: number;
  initial: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial ?? "");
  const [saved, setSaved] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/recipes/${recipeId}/versions/${versionNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changeNote: value }),
    });
    setSaved(value);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div
        className="flex items-start gap-3 p-4 rounded-2xl mb-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <p className="flex-1 italic" style={{ color: "var(--muted)" }}>
          {saved ? `"${saved}"` : <span className="not-italic text-sm">No change note — tap to add one</span>}
        </p>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center justify-center flex-shrink-0 px-3 h-8 text-sm font-medium rounded-lg border"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-2xl mb-6 flex flex-col gap-3"
      style={{ background: "var(--card)", border: "1px solid var(--accent)" }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What changed in this version?"
        className="w-full px-4 py-3 text-base rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]"
        style={{ borderColor: "var(--border)" }}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") { setValue(saved); setEditing(false); }
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center flex-1 py-2.5 text-sm text-white font-semibold rounded-xl disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => { setValue(saved); setEditing(false); }}
          className="flex items-center justify-center flex-1 py-2.5 text-sm font-semibold rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
