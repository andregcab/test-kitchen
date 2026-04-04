import { prisma } from '@/lib/db';
import Link from 'next/link';
import RecipesClient from '@/components/RecipesClient';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const [recipes, menus] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
      include: {
        currentVersion: true,
        menus: { select: { id: true } },
      },
    }),
    prisma.menu.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { recipes: true } } },
    }),
  ]);

  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--muted)' }}
          >
            {recipes.length}{' '}
            {recipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-7xl mb-5">🍳</div>
          <p className="text-2xl font-bold mb-2">No recipes yet</p>
          <p className="mb-8" style={{ color: 'var(--muted)' }}>
            Add your first recipe to get started
          </p>
          <Link
            href="/recipes/new"
            className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-xl"
            style={{ background: 'var(--accent)' }}
          >
            Add Recipe
          </Link>
        </div>
      ) : (
        <RecipesClient recipes={recipes} menus={menus} />
      )}
    </div>
  );
}
