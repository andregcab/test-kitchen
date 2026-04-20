import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RecipeData } from '@/lib/types';
import { getTagColor } from '@/lib/tagColors';
import DeleteRecipeButton from '@/components/DeleteRecipeButton';
import BackButton from '@/components/BackButton';
import MenuPicker from '@/components/MenuPicker';
import ImageCarousel from '@/components/ImageCarousel';
import IngredientsSection from '@/components/IngredientsSection';
import CookModeInstructions from '@/components/CookModeInstructions';
import BranchTabs from '@/components/BranchTabs';

export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const { id } = await params;
  const { branch: branchParam } = await searchParams;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: { orderBy: { versionNumber: 'desc' } },
      menus: { select: { id: true } },
      branches: {
        include: { currentVersion: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!recipe) notFound();

  // Resolve active branch
  const activeBranch = branchParam
    ? recipe.branches.find((b) => b.id === branchParam)
    : recipe.branches.find((b) => b.isDefault);

  // Fall back to recipe's currentVersion if no branch resolved
  const activeVersion = activeBranch?.currentVersion ?? recipe.currentVersion;
  if (!activeVersion) notFound();

  const data = activeVersion.data as unknown as RecipeData;
  const totalTime = (data.prepTime ?? 0) + (data.cookTime ?? 0) || null;
  const color = getTagColor(recipe.tags ?? []);

  // Edit link includes the active branch so the edit page loads the right version
  const editHref = activeBranch && !activeBranch.isDefault
    ? `/recipes/${recipe.id}/edit?branch=${activeBranch.id}`
    : `/recipes/${recipe.id}/edit`;

  // Version history link with branch context
  const versionsHref = activeBranch && !activeBranch.isDefault
    ? `/recipes/${recipe.id}/versions?branch=${activeBranch.id}`
    : `/recipes/${recipe.id}/versions`;

  // Versions for the active branch only (for history panel)
  const branchVersions = activeBranch
    ? recipe.versions.filter((v) => v.branchId === activeBranch.id)
    : recipe.versions;

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
              href={editHref}
              className="flex items-center justify-center px-5 h-11 text-sm font-semibold rounded-xl transition-all active:scale-[0.97] bg-white/65 hover:bg-white/85"
              style={{
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
                  label = new URL(data.source).hostname.replace(/^www\./, '');
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
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
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
            <MenuPicker recipeId={recipe.id} initialMenuIds={recipe.menus.map((m) => m.id)} borderColor={color.border} />
          </div>

          {/* Stats */}
          <div
            className="flex items-end gap-4 mt-auto pt-5"
            style={{ borderTop: `1px solid ${color.border}` }}
          >
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

            {data.servings ? (
              <div className="flex flex-col items-center">
                <div className="text-xl font-semibold leading-none">{data.servings}</div>
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

      {/* ── IMAGE CAROUSEL ── */}
      {recipe.images.length > 0 && (
        <div className="px-[150px] mt-6">
          <ImageCarousel height={560} images={recipe.images} />
        </div>
      )}

      {/* ── BRANCH TABS ── */}
      {recipe.branches.length > 0 && (
        <div className="mt-16">
          <BranchTabs
            recipeId={recipe.id}
            branches={recipe.branches}
            activeBranchId={activeBranch?.id ?? recipe.branches[0]?.id ?? ''}
            currentVersionId={activeVersion.id}
          />
        </div>
      )}

      {/* ── RECIPE BODY ── */}
      {(data.ingredients.length > 0 || data.instructions.length > 0) && (
        <div className="px-[150px] mt-8 flex flex-col gap-8">
          {data.ingredients.length > 0 && (
            <IngredientsSection ingredients={data.ingredients} servings={data.servings} />
          )}
          {data.instructions.length > 0 && (
            <CookModeInstructions instructions={data.instructions} />
          )}
        </div>
      )}

      {/* ── NOTES ── */}
      {data.notes && (
        <div className="px-[150px] mt-8">
          <div
            className="rounded-2xl p-5"
            style={{ background: color.bg, border: `1px solid ${color.border}` }}
          >
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--muted)' }}
            >
              Notes
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap">{data.notes}</p>
          </div>
        </div>
      )}

      {/* ── VERSION HISTORY ── */}
      <div className="max-w-2xl mx-auto px-4 mt-28 mb-2">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
          >
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: 'var(--muted)' }}
            >
              Version History
              {activeBranch && !activeBranch.isDefault && (
                <span
                  className="ml-2 font-normal normal-case tracking-normal px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {activeBranch.name}
                </span>
              )}
              <span
                className="ml-2 font-normal normal-case tracking-normal px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'var(--border)' }}
              >
                {branchVersions.length}
              </span>
            </h2>
            <Link
              href={versionsHref}
              className="text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              See all
            </Link>
          </div>
          <ul>
            {branchVersions.slice(0, 5).map((v, i) => {
              const isCurrent = v.id === activeVersion.id;
              const isLast = i === Math.min(branchVersions.length, 5) - 1;
              return (
                <li
                  key={v.id}
                  style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
                >
                  <Link
                    href={`/recipes/${recipe.id}/versions/${v.versionNumber}${activeBranch && !activeBranch.isDefault ? `?branch=${activeBranch.id}` : ''}`}
                    className="flex items-center gap-3 px-5 py-4"
                    style={{ background: isCurrent ? 'var(--accent-light)' : 'transparent' }}
                  >
                    <span
                      className="text-sm font-bold w-8 text-center flex-shrink-0"
                      style={{ color: isCurrent ? 'var(--accent)' : 'var(--muted)' }}
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
                            style={{ background: 'var(--accent)', color: 'white' }}
                          >
                            current
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {new Date(v.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-[150px] mt-6 pb-10 flex flex-col gap-4">
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <DeleteRecipeButton id={recipe.id} title={recipe.title} />
        </div>
      </div>
    </div>
  );
}
