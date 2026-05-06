import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { RecipeData } from '@/lib/types';
import TopHeader from '@/components/TopHeader';
import SignOutButton from '@/components/SignOutButton';
import ThemeToggle from '@/components/ThemeToggle';
import DisplayNameForm from '@/components/DisplayNameForm';
import { Clock, Star, BookOpen, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div style={{ color: 'var(--accent)', opacity: 0.8 }}>{icon}</div>
      <div className="font-display font-semibold" style={{ fontSize: '28px', lineHeight: 1, color: 'var(--foreground)' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>{label}</div>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [user, recipes] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.recipe.findMany({
      where: { userId: session.userId },
      include: { currentVersion: true },
    }),
  ]);

  if (!user) redirect('/login');

  let totalMinutes = 0;
  let totalServings = 0;
  const tagCounts: Record<string, number> = {};

  for (const recipe of recipes) {
    const data = recipe.currentVersion?.data as RecipeData | null;
    if (data) {
      totalMinutes += (data.prepTime ?? 0) + (data.cookTime ?? 0);
      totalServings += data.servings ?? 0;
    }
    for (const tag of recipe.tags ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  const totalRecipes = recipes.length;
  const favoriteCount = recipes.filter((r) => r.isFavorite).length;
  const totalHours = Math.round(totalMinutes / 60);
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Fun estimates
  const estimatedButter = (totalRecipes * 0.3).toFixed(1);
  const estimatedPeople = totalServings || totalRecipes * 4;

  const funFact = totalRecipes === 0
    ? null
    : `If you cooked everything in your collection at once, you'd spend roughly ${totalHours > 0 ? `${totalHours} ${totalHours === 1 ? 'hour' : 'hours'}` : 'a good while'} at the stove, feed about ${estimatedPeople} people, and go through an estimated ${estimatedButter} lbs of butter. You'd probably need a new apron.`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <TopHeader />

      <div className="page-container py-12">
        {/* Page header */}
        <div className="mb-10">
          <p className="section-label mb-2">Your Kitchen</p>
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 600, color: 'var(--foreground)' }}
          >
            {user.displayName ? `${user.displayName}'s Kitchen` : 'My Kitchen'}
          </h1>
        </div>

        {/* ── KITCHEN STATS ── */}
        <section className="mb-12">
          <h2 className="section-label mb-5">Your Kitchen by Numbers</h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            <StatCard value={totalRecipes} label="recipes" icon={<BookOpen size={20} strokeWidth={1.5} />} />
            <StatCard value={favoriteCount} label="favorites" icon={<Star size={20} strokeWidth={1.5} />} />
            {totalHours > 0 && (
              <StatCard value={`${totalHours}h`} label="total cook time" icon={<Clock size={20} strokeWidth={1.5} />} />
            )}
            {totalServings > 0 && (
              <StatCard value={estimatedPeople} label="total servings" icon={<Users size={20} strokeWidth={1.5} />} />
            )}
          </div>

          {funFact && (
            <div
              className="mt-6 rounded-2xl p-6"
              style={{
                background: 'var(--gold-light)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--gold)',
              }}
            >
              {topTag && (
                <p className="section-label mb-3" style={{ color: 'var(--gold)' }}>
                  Most-cooked: {topTag}
                </p>
              )}
              <p
                className="font-display italic leading-relaxed"
                style={{ fontSize: '16px', color: 'var(--foreground)' }}
              >
                "{funFact}"
              </p>
            </div>
          )}

          {totalRecipes === 0 && (
            <p style={{ color: 'var(--foreground-muted)', fontSize: '15px', marginTop: 12 }}>
              Add some recipes and we'll crunch the numbers.
            </p>
          )}
        </section>

        <div className="ornament-divider mb-12" aria-hidden="true">✦</div>

        {/* ── APPEARANCE ── */}
        <section className="mb-12">
          <h2 className="section-label mb-5">Appearance</h2>
          <ThemeToggle />
        </section>

        <div className="ornament-divider mb-12" aria-hidden="true">✦</div>

        {/* ── ACCOUNT ── */}
        <section>
          <h2 className="section-label mb-5">Account</h2>
          <div
            className="rounded-2xl p-5 flex flex-col gap-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', maxWidth: 400 }}
          >
            <DisplayNameForm currentName={user.displayName ?? ''} />
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: 10 }}>
                Signed in as <strong style={{ color: 'var(--foreground)' }}>{user.username}</strong>
              </p>
              <SignOutButton />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
