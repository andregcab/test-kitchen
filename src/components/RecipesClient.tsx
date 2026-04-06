"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import { BookMarked, Plus } from "lucide-react";

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

  // Cookbooks state
  const [menus, setMenus] = useState(initialMenus);
  const [cookbookSearch, setCookbookSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [newCookbookName, setNewCookbookName] = useState("");
  const [creatingCookbook, setCreatingCookbook] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);

  // Recipe state
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
    <div className="flex flex-col gap-10">

      {/* ── COOKBOOKS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Cookbooks
            {menus.length > 0 && (
              <span
                className="ml-2 font-normal normal-case tracking-normal px-2 py-0.5 rounded-full text-xs"
                style={{ background: "var(--border)" }}
              >
                {menus.length}
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowNewInput((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: showNewInput ? "var(--accent)" : "var(--card)",
              color: showNewInput ? "white" : "var(--accent)",
              border: `1px solid ${showNewInput ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            <Plus size={14} strokeWidth={2} />
            New Cookbook
          </button>
        </div>

        {showNewInput && (
          <div className="flex gap-2 mb-4">
            <input
              autoFocus
              value={newCookbookName}
              onChange={(e) => setNewCookbookName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCookbook()}
              placeholder="Cookbook name…"
              className="flex-1 px-4 py-3 rounded-xl border-2 text-base outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]"
              style={{ borderColor: "var(--border)" }}
            />
            <button
              onClick={createCookbook}
              disabled={creatingCookbook || !newCookbookName.trim()}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              Create
            </button>
          </div>
        )}

        {menus.length > 0 && (
          <>
            {menus.length > 4 && (
              <input
                value={cookbookSearch}
                onChange={(e) => setCookbookSearch(e.target.value)}
                placeholder="Find a cookbook…"
                className="w-full px-4 py-3 mb-3 rounded-xl border-2 text-base outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]"
                style={{ borderColor: "var(--border)" }}
              />
            )}

            <div className="grid grid-cols-4 gap-3">
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
                    }}
                  >
                    <BookMarked size={22} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-base leading-snug truncate">{menu.name}</p>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: active ? "rgba(255,255,255,0.75)" : "var(--muted)" }}
                      >
                        {menu._count.recipes} {menu._count.recipes === 1 ? "recipe" : "recipes"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {menus.length === 0 && !showNewInput && (
          <p className="text-sm py-2" style={{ color: "var(--muted)" }}>
            Group recipes into cookbooks — holiday meals, weeknight dinners, whatever you like.
          </p>
        )}
      </section>

      {/* ── RECIPES ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            {activeMenu ? activeMenu.name : "All Recipes"}
            {activeMenu && (
              <button
                onClick={() => setActiveMenuId(null)}
                className="ml-2 font-normal normal-case tracking-normal text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--border)", color: "var(--foreground)" }}
              >
                ✕ clear
              </button>
            )}
          </h2>
        </div>

        <div className="flex gap-3 mb-6">
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

        {filteredRecipes.length === 0 ? (
          <p className="text-center py-16" style={{ color: "var(--muted)" }}>
            No recipes match
          </p>
        ) : groupByFavorites ? (
          <div className="flex flex-col gap-10">
            {favorites.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                  ★ Favorites
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {favorites.map((r) => (
                    <RecipeCard key={r.id} id={r.id} title={r.title} tags={r.tags} isFavorite={r.isFavorite} images={r.images}currentVersion={r.currentVersion} onFavoriteChange={(val) => handleFavoriteChange(r.id, val)} />
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                {favorites.length > 0 && (
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                    All Recipes
                  </h3>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {rest.map((r) => (
                    <RecipeCard key={r.id} id={r.id} title={r.title} tags={r.tags} isFavorite={r.isFavorite} images={r.images}currentVersion={r.currentVersion} onFavoriteChange={(val) => handleFavoriteChange(r.id, val)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredRecipes.map((r) => (
              <RecipeCard key={r.id} id={r.id} title={r.title} tags={r.tags} isFavorite={r.isFavorite} images={r.images} currentVersion={r.currentVersion} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
