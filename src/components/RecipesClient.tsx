"use client";

import { useState, useMemo } from "react";
import RecipeCard from "@/components/RecipeCard";

interface Menu {
  id: string;
  name: string;
  _count: { recipes: number };
}

interface Recipe {
  id: string;
  title: string;
  tags: string[];
  isFavorite: boolean;
  updatedAt: Date | string;
  currentVersion: { data: unknown } | null;
  menus: { id: string }[];
}

type SortOption = "updated" | "alpha" | "cookTime";

interface Props {
  recipes: Recipe[];
  menus: Menu[];
}

export default function RecipesClient({ recipes, menus }: Props) {
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("updated");

  const filtered = useMemo(() => {
    let list = recipes;

    if (activeMenuId) {
      list = list.filter((r) => r.menus.some((m) => m.id === activeMenuId));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        if (r.title.toLowerCase().includes(q)) return true;
        if (r.tags.some((t) => t.toLowerCase().includes(q))) return true;
        const ingredients = (r.currentVersion?.data as { ingredients?: { name: string }[] } | null)?.ingredients ?? [];
        if (ingredients.some((ing) => ing.name.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    return [...list].sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "cookTime") {
        const aTime = (a.currentVersion?.data as { cookTime?: number } | null)?.cookTime ?? 999;
        const bTime = (b.currentVersion?.data as { cookTime?: number } | null)?.cookTime ?? 999;
        return aTime - bTime;
      }
      // updated — favorites first, then by date
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [recipes, activeMenuId, search, sort]);

  const favorites = filtered.filter((r) => r.isFavorite);
  const rest = filtered.filter((r) => !r.isFavorite);
  const groupByFavorites = sort === "updated" && !search.trim();

  return (
    <div className="flex flex-col gap-6">
      {/* Search + Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ color: "var(--muted)" }}
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 text-base outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-3 rounded-xl border-2 text-sm font-medium outline-none focus:border-[var(--accent)] bg-[var(--background)]"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="updated">Recent</option>
          <option value="alpha">A – Z</option>
          <option value="cookTime">Cook time</option>
        </select>
      </div>

      {/* Menu chips */}
      {menus.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setActiveMenuId(null)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{
              background: activeMenuId === null ? "var(--accent)" : "var(--card)",
              color: activeMenuId === null ? "white" : "var(--foreground)",
              border: `1px solid ${activeMenuId === null ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            All
          </button>
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenuId(activeMenuId === menu.id ? null : menu.id)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                background: activeMenuId === menu.id ? "var(--accent)" : "var(--card)",
                color: activeMenuId === menu.id ? "white" : "var(--foreground)",
                border: `1px solid ${activeMenuId === menu.id ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {menu.name}
              <span className="ml-1.5 opacity-70">{menu._count.recipes}</span>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-center py-16" style={{ color: "var(--muted)" }}>
          No recipes match
        </p>
      ) : groupByFavorites ? (
        <div className="flex flex-col gap-10">
          {favorites.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                ★ Favorites
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {favorites.map((r) => (
                  <RecipeCard key={r.id} id={r.id} title={r.title} tags={r.tags} isFavorite={r.isFavorite} currentVersion={r.currentVersion} />
                ))}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              {favorites.length > 0 && (
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                  All Recipes
                </h2>
              )}
              <div className="grid grid-cols-2 gap-3">
                {rest.map((r) => (
                  <RecipeCard key={r.id} id={r.id} title={r.title} tags={r.tags} isFavorite={r.isFavorite} currentVersion={r.currentVersion} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((r) => (
            <RecipeCard key={r.id} id={r.id} title={r.title} tags={r.tags} isFavorite={r.isFavorite} currentVersion={r.currentVersion} />
          ))}
        </div>
      )}
    </div>
  );
}
