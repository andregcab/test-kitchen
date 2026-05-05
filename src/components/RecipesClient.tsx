"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import { BookOpen, Plus, Search, X } from "lucide-react";

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
  images: string[];
  updatedAt: Date | string;
  currentVersion: { data: unknown } | null;
  menus: { id: string }[];
}

type SortOption = "updated" | "alpha" | "cookTime";

interface Props {
  recipes: Recipe[];
  menus: Menu[];
}

export default function RecipesClient({ recipes, menus: initialMenus }: Props) {
  const router = useRouter();

  const [menus, setMenus] = useState(initialMenus);
  const [cookbookSearch, setCookbookSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [newCookbookName, setNewCookbookName] = useState("");
  const [creatingCookbook, setCreatingCookbook] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);

  const [localRecipes, setLocalRecipes] = useState(recipes);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("updated");

  function handleFavoriteChange(id: string, isFavorite: boolean) {
    setLocalRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite } : r))
    );
  }

  const filteredMenus = useMemo(() => {
    if (!cookbookSearch.trim()) return menus;
    const q = cookbookSearch.toLowerCase();
    return menus.filter((m) => m.name.toLowerCase().includes(q));
  }, [menus, cookbookSearch]);

  const filteredRecipes = useMemo(() => {
    let list = localRecipes;

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
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [localRecipes, activeMenuId, search, sort]);

  async function createCookbook() {
    if (!newCookbookName.trim()) return;
    setCreatingCookbook(true);
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCookbookName.trim() }),
    });
    const menu = await res.json();
    setMenus((prev) => [...prev, { ...menu, _count: { recipes: 0 } }]);
    setNewCookbookName("");
    setShowNewInput(false);
    setCreatingCookbook(false);
    router.refresh();
  }

  const favorites = filteredRecipes.filter((r) => r.isFavorite);
  const rest = filteredRecipes.filter((r) => !r.isFavorite);
  const groupByFavorites = sort === "updated" && !search.trim() && !activeMenuId;
  const activeMenu = menus.find((m) => m.id === activeMenuId);

  return (
    <div className="flex flex-col gap-12">

      {/* ── COOKBOOKS ── */}
      {(menus.length > 0 || showNewInput) && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-label">
              Cookbooks
              {menus.length > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--gold-light)',
                    color: 'var(--gold)',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {menus.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowNewInput((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: showNewInput ? "var(--accent)" : "var(--surface)",
                color: showNewInput ? "white" : "var(--accent)",
                border: `1px solid ${showNewInput ? "var(--accent)" : "var(--border)"}`,
                fontSize: '13px',
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              New Cookbook
            </button>
          </div>

          {showNewInput && (
            <div className="flex gap-2 mb-5">
              <input
                autoFocus
                value={newCookbookName}
                onChange={(e) => setNewCookbookName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createCookbook()}
                placeholder="Cookbook name…"
                className="flex-1 px-4 rounded-xl border-2 text-base outline-none transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                onClick={createCookbook}
                disabled={creatingCookbook || !newCookbookName.trim()}
                className="px-5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                Create
              </button>
            </div>
          )}

          {menus.length > 4 && (
            <input
              value={cookbookSearch}
              onChange={(e) => setCookbookSearch(e.target.value)}
              placeholder="Find a cookbook…"
              className="w-full px-4 mb-4 rounded-xl border-2 text-base outline-none transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          )}

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
          >
            {filteredMenus.map((menu) => {
              const active = activeMenuId === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenuId(active ? null : menu.id)}
                  className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: active ? "var(--accent)" : "var(--card)",
                    color: active ? "white" : "var(--foreground)",
                    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    boxShadow: active ? "0 2px 12px rgba(74,103,65,0.2)" : "none",
                  }}
                >
                  <BookOpen
                    size={20}
                    strokeWidth={1.5}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: active ? 'rgba(255,255,255,0.8)' : 'var(--gold)' }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug truncate" style={{ fontSize: '15px' }}>{menu.name}</p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--foreground-muted)" }}
                    >
                      {menu._count.recipes} {menu._count.recipes === 1 ? "recipe" : "recipes"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="ornament-divider mt-10" aria-hidden="true">✦</div>
        </section>
      )}

      {/* ── RECIPES ── */}
      <section>
        {/* Search + sort bar */}
        <div className="flex gap-3 mb-7">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--foreground-muted)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes, ingredients, tags…"
              className="w-full pl-10 pr-4 rounded-xl border-2 text-base outline-none transition-colors"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 rounded-xl border-2 text-sm font-medium outline-none"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          >
            <option value="updated">Recent</option>
            <option value="alpha">A – Z</option>
            <option value="cookTime">Cook time</option>
          </select>
        </div>

        {/* Active cookbook filter badge */}
        {activeMenu && (
          <div className="flex items-center gap-2 mb-5">
            <span className="section-label" style={{ color: 'var(--foreground-muted)' }}>
              Showing:
            </span>
            <button
              onClick={() => setActiveMenuId(null)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
            >
              {activeMenu.name}
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <p className="text-xl font-display" style={{ color: "var(--foreground-muted)" }}>
              No recipes found
            </p>
            {(search.trim() || activeMenuId) && (
              <button
                onClick={() => { setSearch(""); setActiveMenuId(null); }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : groupByFavorites ? (
          <div className="flex flex-col gap-10">
            {favorites.length > 0 && (
              <div>
                <h3 className="section-label mb-4" style={{ color: 'var(--gold)', letterSpacing: '0.12em' }}>
                  ★ Favorites
                </h3>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {favorites.map((r) => (
                    <RecipeCard
                      key={r.id}
                      id={r.id}
                      title={r.title}
                      tags={r.tags}
                      isFavorite={r.isFavorite}
                      images={r.images}
                      currentVersion={r.currentVersion}
                      onFavoriteChange={(val) => handleFavoriteChange(r.id, val)}
                      onTagClick={setSearch}
                    />
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                {favorites.length > 0 && (
                  <h3 className="section-label mb-4">All Recipes</h3>
                )}
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {rest.map((r) => (
                    <RecipeCard
                      key={r.id}
                      id={r.id}
                      title={r.title}
                      tags={r.tags}
                      isFavorite={r.isFavorite}
                      images={r.images}
                      currentVersion={r.currentVersion}
                      onFavoriteChange={(val) => handleFavoriteChange(r.id, val)}
                      onTagClick={setSearch}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {filteredRecipes.map((r) => (
              <RecipeCard
                key={r.id}
                id={r.id}
                title={r.title}
                tags={r.tags}
                isFavorite={r.isFavorite}
                images={r.images}
                currentVersion={r.currentVersion}
                onTagClick={setSearch}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
