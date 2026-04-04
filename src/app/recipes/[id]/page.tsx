import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RecipeData } from '@/lib/types';
import { getTagColor } from '@/lib/tagColors';
import DeleteRecipeButton from '@/components/DeleteRecipeButton';
import BackButton from '@/components/BackButton';
import MenuPicker from '@/components/MenuPicker';

export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: { orderBy: { versionNumber: 'desc' } },
      menus: { select: { id: true } },
    },
  });

  if (!recipe || !recipe.currentVersion) notFound();

  const data = recipe.currentVersion.data as unknown as RecipeData;

  function abbrevUnit(unit: string): string {
    const map: Record<string, string> = {
      tablespoon: 'tbsp',
      tablespoons: 'tbsp',
      teaspoon: 'tsp',
      teaspoons: 'tsp',
      cup: 'cup',
      cups: 'cup',
      ounce: 'oz',
      ounces: 'oz',
      pound: 'lb',
      pounds: 'lb',
      gram: 'g',
      grams: 'g',
      kilogram: 'kg',
      kilograms: 'kg',
      milliliter: 'ml',
      milliliters: 'ml',
      millilitre: 'ml',
      millilitres: 'ml',
      liter: 'L',
      liters: 'L',
      litre: 'L',
      litres: 'L',
      'fluid ounce': 'fl oz',
      'fluid ounces': 'fl oz',
    };
    return map[unit.toLowerCase()] ?? unit;
  }
  const totalTime =
    (data.prepTime ?? 0) + (data.cookTime ?? 0) || null;
  const color = getTagColor(recipe.tags ?? []);

  return (
    <div>
      {/* ── HERO ── */}
      <div className="px-[150px] pt-6">
        <div
          className="rounded-2xl px-5 pt-5 pb-7 flex flex-col relative"
          style={{
            background: color.bg,
            border: `1px solid ${color.border}`,
            minHeight: 360,
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <BackButton href="/recipes" />
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="flex items-center justify-center px-5 h-11 text-sm font-semibold rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.65)',
                color: 'var(--foreground)',
                border: `1px solid ${color.border}`,
              }}
            >
              Edit
            </Link>
          </div>

          {/* Tags */}
          {(recipe.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(recipe.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.65)',
                    color: 'var(--foreground)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight">
            {recipe.title}
          </h1>

          {/* Source */}
          {data.source &&
            (() => {
              const isUrl = /^https?:\/\//i.test(data.source);
              if (isUrl) {
                let label = data.source;
                try {
                  label = new URL(data.source).hostname.replace(
                    /^www\./,
                    '',
                  );
                } catch {
                  /* keep full url */
                }
                return (
                  <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                    Source:{' '}
                    <a
                      href={data.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {label}
                    </a>
                  </p>
                );
              }
              return (
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'var(--muted)' }}
                >
                  Source: {data.source}
                </p>
              );
            })()}

          {/* Description */}
          {data.description && (
            <p
              className="mt-5 mb-2 text-base leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              {data.description}
            </p>
          )}

          {/* Add to Menu — bottom right */}
          <div className="absolute bottom-5 right-5">
            <MenuPicker recipeId={recipe.id} initialMenuIds={recipe.menus.map((m) => m.id)} />
          </div>

          {/* Stats — always shown, placeholders when empty */}
          <div
            className="flex items-end gap-4 mt-auto pt-5"
            style={{ borderTop: `1px solid ${color.border}` }}
          >
            {/* Total */}
            {totalTime ? (
              <div className="flex-shrink-0">
                <div className="text-4xl font-bold leading-none">{totalTime}</div>
                <div className="text-sm mt-1 font-medium" style={{ color: 'var(--foreground)', opacity: 0.6 }}>min total</div>
              </div>
            ) : (
              <div
                className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-14 rounded-xl"
                style={{ border: `1.5px dashed ${color.border}`, opacity: 0.5 }}
              >
                <div className="text-xl font-bold leading-none">?</div>
                <div className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>min</div>
              </div>
            )}

            <div className="self-stretch w-px mx-1" style={{ background: color.border }} />

            {/* Prep + Cook */}
            <div className="flex gap-4">
              {data.prepTime ? (
                <div>
                  <div className="text-xl font-semibold leading-none">{data.prepTime}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>prep</div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-12 h-14 rounded-xl"
                  style={{ border: `1.5px dashed ${color.border}`, opacity: 0.5 }}
                >
                  <div className="text-base font-bold leading-none">?</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>prep</div>
                </div>
              )}
              {data.cookTime ? (
                <div>
                  <div className="text-xl font-semibold leading-none">{data.cookTime}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>cook</div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-12 h-14 rounded-xl"
                  style={{ border: `1.5px dashed ${color.border}`, opacity: 0.5 }}
                >
                  <div className="text-base font-bold leading-none">?</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>cook</div>
                </div>
              )}
            </div>

            <div className="self-stretch w-px mx-1" style={{ background: color.border }} />

            {/* Servings */}
            {data.servings ? (
              <div className="flex flex-col items-center">
                <div className="text-xl font-semibold leading-none">
                  {data.servings}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>servings</div>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-14 h-14 rounded-xl"
                style={{ border: `1.5px dashed ${color.border}`, opacity: 0.5 }}
              >
                <div className="text-base font-bold leading-none">?</div>
                <div className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>servings</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RECIPE BODY — ingredients + instructions ── */}
      {(data.ingredients.length > 0 ||
        data.instructions.length > 0) && (
        <div className="px-[150px] mt-28 flex flex-col gap-8">
          {data.ingredients.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Ingredients</h2>
              <ul className="flex flex-col">
                {data.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className="flex gap-6 py-3"
                    style={{
                      borderBottom:
                        i < data.ingredients.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                  >
                    <span
                      className="w-32 flex-shrink-0 text-left font-semibold tabular-nums"
                      style={{ color: 'var(--accent)' }}
                    >
                      {[
                        ing.amount,
                        ing.unit ? abbrevUnit(ing.unit) : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </span>
                    <span className="pl-3">
                      {ing.name}
                      {ing.notes && ` ${ing.notes}`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.instructions.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Instructions</h2>
              <ol className="flex flex-col gap-3">
                {data.instructions.map((inst) => (
                  <li
                    key={inst.step}
                    className="flex gap-4 p-4 rounded-xl"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'var(--accent)' }}
                    >
                      {inst.step}
                    </span>
                    <p className="pt-1 leading-relaxed">
                      {inst.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}

      {/* ── NOTES — distinct from recipe body ── */}
      {data.notes && (
        <div className="px-[150px] mt-8">
          <div
            className="rounded-2xl p-5"
            style={{
              background: color.bg,
              border: `1px solid ${color.border}`,
            }}
          >
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--muted)' }}
            >
              Notes
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap">
              {data.notes}
            </p>
          </div>
        </div>
      )}

      {/* ── VERSION HISTORY — its own zone ── */}
      <div className="max-w-2xl mx-auto px-4 mt-28 mb-2">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{
              background: 'var(--card)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: 'var(--muted)' }}
            >
              Version History
              <span
                className="ml-2 font-normal normal-case tracking-normal px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'var(--border)' }}
              >
                {recipe.versions.length}
              </span>
            </h2>
            <Link
              href={`/recipes/${recipe.id}/versions`}
              className="text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              See all
            </Link>
          </div>
          <ul>
            {recipe.versions.slice(0, 5).map((v, i) => {
              const isCurrent = v.id === recipe.currentVersionId;
              const isLast =
                i === Math.min(recipe.versions.length, 5) - 1;
              return (
                <li
                  key={v.id}
                  style={{
                    borderBottom: isLast
                      ? 'none'
                      : '1px solid var(--border)',
                  }}
                >
                  <Link
                    href={`/recipes/${recipe.id}/versions/${v.versionNumber}`}
                    className="flex items-center gap-3 px-5 py-4"
                    style={{
                      background: isCurrent
                        ? 'var(--accent-light)'
                        : 'transparent',
                    }}
                  >
                    <span
                      className="text-sm font-bold w-8 text-center flex-shrink-0"
                      style={{
                        color: isCurrent
                          ? 'var(--accent)'
                          : 'var(--muted)',
                      }}
                    >
                      v{v.versionNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {v.changeNote ?? 'No change note'}
                        </p>
                        {isCurrent && (
                          <span
                            className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: 'var(--accent)',
                              color: 'white',
                            }}
                          >
                            current
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--muted)' }}
                      >
                        {new Date(v.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          },
                        )}
                      </p>
                    </div>
                    <svg
                      width="8"
                      height="14"
                      viewBox="0 0 8 14"
                      fill="none"
                      style={{ color: 'var(--muted)', flexShrink: 0 }}
                    >
                      <path
                        d="M1 1l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── FOOTER — source + delete ── */}
      <div className="px-[150px] mt-6 pb-10 flex flex-col gap-4">
        <div
          className="pt-2 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <DeleteRecipeButton id={recipe.id} title={recipe.title} />
        </div>
      </div>
    </div>
  );
}
