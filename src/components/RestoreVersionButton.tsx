"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RestoreVersionButton({
  recipeId,
  versionNumber,
}: {
  recipeId: string;
  versionNumber: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    const res = await fetch(
      `/api/recipes/${recipeId}/versions/${versionNumber}/restore`,
      { method: "POST" }
    );
    if (res.ok) {
      router.push(`/recipes/${recipeId}`);
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-medium">
          Restore version {versionNumber}? A new version will be created with this content.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRestore}
            disabled={loading}
            className="flex-1 py-4 text-white font-semibold rounded-xl disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Restoring…" : "Yes, restore it"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-4 font-semibold rounded-xl border"
            style={{ borderColor: "var(--border)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full py-4 text-white font-semibold rounded-xl"
      style={{ background: "var(--accent)" }}
    >
      Restore this version
    </button>
  );
}
