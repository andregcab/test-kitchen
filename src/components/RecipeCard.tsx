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
  images?: string[];
  currentVersion: { data: unknown } | null;
  onFavoriteChange?: (isFavorite: boolean) => void;
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
  images,
  currentVersion,
  onFavoriteChange,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const color = getTagColor(tags);
  const data = currentVersion?.data as RecipeData | null;
  const totalTime = data ? (data.prepTime ?? 0) + (data.cookTime ?? 0) || null : null;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFavorite;
    setIsFavorite(next);
    onFavoriteChange?.(next);
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
          className="relative h-48 flex items-end p-3"
          style={{ background: color.bg }}
        >
          {/* Photo if available */}
          {images && images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Overlay so tag + star stay readable over photos */}
          {images && images[0] && (
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }}
            />
          )}

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full transition-colors z-10"
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
              className="relative z-10 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.75)",
                color: "var(--foreground)",
              }}
            >
              {tags[0]}
            </span>
          )}
        </div>

        {/* Card content — fixed layout so all cards align */}
        <div className="p-4 flex flex-col" style={{ minHeight: 96 }}>
          {/* Title always reserves 2 lines */}
          <h2
            className="font-bold text-base leading-snug mb-auto"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em",
            }}
          >
            {title}
          </h2>
          {/* Stats always at bottom, with placeholders */}
          <div className="flex items-center gap-5 text-sm mt-3" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6.5 3.5V6.5L8.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {totalTime ? `${totalTime} min` : "? min"}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1" />
              </svg>
              {data?.servings ? `${data.servings} servings` : '? servings'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
