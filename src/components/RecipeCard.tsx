"use client";

import Link from "next/link";
import { useState } from "react";
import { UtensilsCrossed, Soup, Wheat, Salad, Utensils, Clock, Users, Star } from "lucide-react";
import { getTagColor } from "@/lib/tagColors";
import { RecipeData } from "@/lib/types";

const PLACEHOLDER_ICONS = [UtensilsCrossed, Soup, Wheat, Salad];

function placeholderIcon(id: string) {
  const index = id.charCodeAt(0) % PLACEHOLDER_ICONS.length;
  const Icon = PLACEHOLDER_ICONS[index];
  return <Icon size={36} strokeWidth={1.25} />;
}

interface Props {
  id: string;
  title: string;
  tags: string[];
  isFavorite: boolean;
  images?: string[];
  currentVersion: { data: unknown } | null;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onTagClick?: (tag: string) => void;
}


export default function RecipeCard({
  id,
  title,
  tags,
  isFavorite: initialFavorite,
  images,
  currentVersion,
  onFavoriteChange,
  onTagClick,
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
          {/* Placeholder icon when no photo */}
          {(!images || !images[0]) && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.25 }}>
              {placeholderIcon(id)}
            </div>
          )}

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
            <Star size={16} strokeWidth={1.5} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Tag pill */}
          {tags[0] && (
            <button
              onClick={(e) => { e.preventDefault(); onTagClick?.(tags[0]); }}
              className="relative z-10 text-xs font-semibold px-2.5 py-1 rounded-full transition-opacity active:opacity-70"
              style={{
                background: "rgba(255,255,255,0.75)",
                color: "var(--foreground)",
                cursor: onTagClick ? "pointer" : "default",
              }}
            >
              {tags[0]}
            </button>
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
          <div className="flex items-center gap-5 text-sm mt-3">
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--foreground)', opacity: 0.75 }}><Clock size={13} strokeWidth={1.5} /></span>
              <span style={{ color: 'var(--foreground)', }}>{totalTime ? `${totalTime} min` : "? min"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--foreground)', opacity: 0.75 }}><Users size={13} strokeWidth={1.5} /></span>
              <span style={{ color: 'var(--foreground)', }}>{data?.servings ? `${data.servings} servings` : '? servings'}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
