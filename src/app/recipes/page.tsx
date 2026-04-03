import { prisma } from "@/lib/db";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
    include: { currentVersion: true },
  });

  const favorites = recipes.filter((r) => r.isFavorite);
  const rest = recipes.filter((r) => !r.isFavorite);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-7xl mb-5">🍳</div>
          <p className="text-2xl font-bold mb-2">No recipes yet</p>
          <p className="mb-8" style={{ color: "var(--muted)" }}>
            Add your first recipe to get started
          </p>
          <Link
            href="/recipes/new"
            className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-xl"
            style={{ background: "var(--accent)" }}
          >
            Add Recipe
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* Favorites */}
          {favorites.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                ★ Favorites
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {favorites.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    tags={recipe.tags ?? []}
                    isFavorite={recipe.isFavorite}
                    currentVersion={recipe.currentVersion}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All recipes */}
          {rest.length > 0 && (
            <section>
              {favorites.length > 0 && (
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
                  All Recipes
                </h2>
              )}
              <div className="grid grid-cols-2 gap-3">
                {rest.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    tags={recipe.tags ?? []}
                    isFavorite={recipe.isFavorite}
                    currentVersion={recipe.currentVersion}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
