import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RecipesClient from '@/components/RecipesClient';
import SignOutButton from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const { userId } = session;

  const [recipes, menus] = await Promise.all([
    prisma.recipe.findMany({
      where: { userId },
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
      include: {
        currentVersion: true,
        menus: { select: { id: true } },
      },
    }),
    prisma.menu.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { recipes: true } } },
    }),
  ]);

  return (
    <div className="page-container py-10">
      {/* Page header */}
      <div className="mb-10">
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 600, color: 'var(--foreground)' }}>
          My Kitchen
        </h1>
        <p className="mt-1 section-label" style={{ color: 'var(--foreground-muted)', fontWeight: 400, letterSpacing: '0.04em', textTransform: 'none', fontSize: '15px' }}>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} in your collection
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-5">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}
          >
            <span style={{ fontSize: 40 }}>🍳</span>
          </div>
          <div>
            <p className="text-2xl font-display font-semibold mb-2">No recipes yet</p>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Add your first recipe to get started
            </p>
          </div>
          <Link
            href="/recipes/new"
            className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-xl mt-2"
            style={{ background: 'var(--accent)', fontSize: '16px', letterSpacing: '0.02em' }}
          >
            Add a Recipe
          </Link>
        </div>
      ) : (
        <RecipesClient recipes={recipes} menus={menus} />
      )}

      {/* Sign out — deliberate, not accidental */}
      <div className="mt-16 pt-6 border-t flex justify-center" style={{ borderColor: 'var(--border)' }}>
        <SignOutButton />
      </div>
    </div>
  );
}
