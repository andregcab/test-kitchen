"use client";

import Link from "next/link";
import { useState } from "react";
import { UtensilsCrossed, Soup, Wheat, Salad, Clock, Users, Star } from "lucide-react";
import { getTagColor } from "@/lib/tagColors";
import { RecipeData } from "@/lib/types";

const PLACEHOLDER_ICONS = [UtensilsCrossed, Soup, Wheat, Salad];

function placeholderIcon(id: string) {
  const index = id.charCodeAt(0) % PLACEHOLDER_ICONS.length;
  const Icon = PLACEHOLDER_ICONS[index];
  return <Icon size={32} strokeWidth={1.1} />;
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
  const hasPhoto = !!(images && images[0]);

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
      {/* height:100% lets this fill the grid row (grid stretches items by default) */}
      <div
        data-tag-index={color.index}
        className="recipe-card rounded-2xl overflow-hidden active:scale-[0.98] flex flex-col"
        style={{
          height: '100%',
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}
      >
        {/* ── IMAGE / SWATCH — aspect ratio scales with column width ── */}
        <div
          className="relative"
          style={{ aspectRatio: '3/2', flexShrink: 0, background: 'var(--tag-bg)' }}
        >
          {!hasPhoto && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: 'var(--tag-color)', opacity: 0.3 }}
            >
              {placeholderIcon(id)}
            </div>
          )}

          {hasPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images![0]}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {hasPhoto && (
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 45%)' }}
            />
          )}

          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full z-10"
            style={{
              background: isFavorite ? "var(--gold)" : "rgba(0,0,0,0.32)",
              color: "white",
              backdropFilter: 'blur(4px)',
              transition: 'background 200ms ease',
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={14} strokeWidth={1.5} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* ── CARD BODY — flex-col so meta pins to the bottom ── */}
        <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
          {/* Title */}
          <h2
            className="font-display font-semibold leading-snug"
            style={{
              fontSize: '17px',
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.5em",
              color: 'var(--foreground)',
            }}
          >
            {title}
          </h2>

          {/* Tags — up to 2 shown, +N badge for overflow; slot always reserves 28px */}
          <div className="flex flex-wrap gap-1.5" style={{ minHeight: 28, marginTop: 8 }}>
            {tags.slice(0, 2).map((tag) => (
              <button
                key={tag}
                onClick={(e) => { e.preventDefault(); onTagClick?.(tag); }}
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--tag-bg)',
                  color: 'var(--tag-color)',
                  border: '1px solid var(--tag-border)',
                  cursor: onTagClick ? "pointer" : "default",
                  letterSpacing: '0.03em',
                }}
              >
                {tag}
              </button>
            ))}
            {tags.length > 2 && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--foreground-faint)',
                  border: '1px solid var(--border)',
                }}
              >
                +{tags.length - 2}
              </span>
            )}
          </div>

          {/* Meta — pushed to bottom */}
          <div
            className="flex items-center gap-4 mt-auto card-meta"
            style={{ paddingTop: 12, fontSize: '13px' }}
          >
            <span className="flex items-center gap-1.5">
              <Clock size={12} strokeWidth={1.5} />
              <span>{totalTime ? `${totalTime} min` : "—"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={12} strokeWidth={1.5} />
              <span>{data?.servings ? `${data.servings} servings` : '—'}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
