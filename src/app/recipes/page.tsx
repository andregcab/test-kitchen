import { prisma } from "@/lib/db";
import Link from "next/link";
import { RecipeData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { updatedAt: "desc" },
    include: { currentVersion: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <span
          className="text-sm px-3 py-1 rounded-full"
          style={{ background: "var(--border)", color: "var(--muted)" }}
        >
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </span>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍳</div>
          <p className="text-xl font-medium mb-2">No recipes yet</p>
          <p style={{ color: "var(--muted)" }} className="mb-8">
            Add your first recipe to get started
          </p>
          <Link
            href="/recipes/new"
            className="inline-block px-8 py-4 text-white font-semibold rounded-xl"
            style={{ background: "var(--accent)" }}
          >
            Add Recipe
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {recipes.map((recipe) => {
            const data = recipe.currentVersion?.data as RecipeData | null;
            return (
              <li key={recipe.id}>
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="flex items-center justify-between p-5 rounded-2xl border transition-colors hover:border-[var(--accent)]"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold truncate">
                      {recipe.title}
                    </h2>
                    {data?.description && (
                      <p
                        className="mt-1 text-sm line-clamp-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {data.description}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2 text-sm" style={{ color: "var(--muted)" }}>
                      {data?.prepTime && <span>⏱ {data.prepTime} min prep</span>}
                      {data?.servings && <span>🍽 {data.servings} servings</span>}
                      {recipe.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "var(--border)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="ml-4 text-2xl" style={{ color: "var(--muted)" }}>›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
