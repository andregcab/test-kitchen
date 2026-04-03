"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteRecipeButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    router.push("/recipes");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-medium">
          Delete &ldquo;{title}&rdquo;? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 text-white font-semibold rounded-xl disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-3 font-semibold rounded-xl border"
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
      className="w-full py-3 font-medium rounded-xl"
      style={{ color: "var(--accent)" }}
    >
      Delete Recipe
    </button>
  );
}
