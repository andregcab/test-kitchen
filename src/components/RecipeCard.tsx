"use client";

import Link from "next/link";
import { useState } from "react";
import { getTagColor } from "@/lib/tagColors";
import { RecipeData } from "@/lib/types";

interface Props {
  id: string;
  title: string;
  tags: string[];
  isFavorite: boolean;
  currentVersion: { data: unknown } | null;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.3l-4.8 2.5.9-5.3L2.2 7.7l5.4-.8L10 2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecipeCard({
  id,
  title,
  tags,
  isFavorite: initialFavorite,
  currentVersion,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const color = getTagColor(tags);
  const data = currentVersion?.data as RecipeData | null;
  const totalTime = data ? (data.prepTime ?? 0) + (data.cookTime ?? 0) || null : null;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
    await fetch(`/api/recipes/${id}/favorite`, { method: "PATCH" });
  }

  return (
    <Link href={`/recipes/${id}`} className="block group">
      <div
        className="rounded-2xl overflow-hidden transition-transform active:scale-[0.98]"
        style={{ border: `1px solid ${color.border}`, background: "var(--card)" }}
      >
        {/* Color / photo area */}
        <div
          className="relative h-32 flex items-end p-3"
          style={{ background: color.bg }}
        >
          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{
              background: isFavorite ? "var(--accent)" : "rgba(255,255,255,0.75)",
              color: isFavorite ? "white" : "var(--muted)",
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <StarIcon filled={isFavorite} />
          </button>

          {/* Tag pill */}
          {tags[0] && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.75)", color: "var(--foreground)" }}
            >
              {tags[0]}
            </span>
          )}
        </div>

        {/* Card content */}
        <div className="p-4">
          <h2 className="font-bold text-base leading-snug line-clamp-2 mb-2">
            {title}
          </h2>
          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
            {totalTime && (
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M6.5 3.5V6.5L8.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {totalTime} min
              </span>
            )}
            {data?.servings && (
              <span>{data.servings} servings</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
