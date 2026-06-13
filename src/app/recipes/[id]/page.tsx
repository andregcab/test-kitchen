import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RecipeData } from '@/lib/types';
import { getTagColor } from '@/lib/tagColors';
import { getSession } from '@/lib/session';
import DeleteRecipeButton from '@/components/DeleteRecipeButton';
import BackButton from '@/components/BackButton';
import MenuPicker from '@/components/MenuPicker';
import ImageCarousel from '@/components/ImageCarousel';
import IngredientsSection from '@/components/IngredientsSection';
import CookModeInstructions from '@/components/CookModeInstructions';
import BranchTabs from '@/components/BranchTabs';
import SectionEditDetails from '@/components/SectionEditDetails';
import SectionEditIngredients from '@/components/SectionEditIngredients';
import SectionEditInstructions from '@/components/SectionEditInstructions';
import SectionEditNotes from '@/components/SectionEditNotes';
import SectionEditPhotos from '@/components/SectionEditPhotos';
import ShareRecipeButton from '@/components/ShareRecipeButton';
import MarkSeen from '@/components/MarkSeen';
import { Clock, ChefHat, Users, ExternalLink } from 'lucide-react';

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

  const [recipe, session] = await Promise.all([
    prisma.recipe.findUnique({
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
    }),
    getSession(),
  ]);

  // A deleted (or non-existent) recipe — e.g. hitting Back after deleting —
  // should land on the recipe list, not a dead-end 404.
  if (!recipe) redirect('/recipes');

  const isOwner = session?.userId === recipe.userId;
  const isNew = !!recipe.sharedFromRecipeId && !recipe.seenAt;

  const activeBranch = branchParam
    ? recipe.branches.find((b) => b.id === branchParam)
    : recipe.branches.find((b) => b.isDefault);

  const activeVersion = activeBranch?.currentVersion ?? recipe.currentVersion;
  if (!activeVersion) redirect('/recipes');

  const data = activeVersion.data as unknown as RecipeData;
  const totalTime = (data.prepTime ?? 0) + (data.cookTime ?? 0) || null;
  const color = getTagColor(recipe.tags ?? []);

  const versionsHref = activeBranch && !activeBranch.isDefault
    ? `/recipes/${recipe.id}/versions?branch=${activeBranch.id}`
    : `/recipes/${recipe.id}/versions`;

  const branchVersions = activeBranch
    ? recipe.versions.filter((v) => v.branchId === activeBranch.id)
    : recipe.versions;

  const hasPhotos = recipe.images.length > 0;

  return (
    <div>
      <MarkSeen recipeId={recipe.id} isNew={isNew} />
      {/* ── HERO — data-tag-index wires CSS vars for both light + dark ── */}
      <div
        data-tag-index={color.index}
        className="relative"
        style={{ background: 'var(--tag-bg)', borderBottom: '1px solid var(--tag-border)' }}
      >
        <div className="page-container pt-10 pb-12">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <BackButton href="/recipes" />
            <div className="flex items-center gap-2">
              <MenuPicker
                recipeId={recipe.id}
                initialMenuIds={recipe.menus.map((m) => m.id)}
                borderColor="var(--tag-border)"
              />
              {isOwner && (
                <ShareRecipeButton recipeId={recipe.id} borderColor="var(--tag-border)" />
              )}
              <SectionEditDetails
                recipeId={recipe.id}
                branchId={activeBranch?.id}
                data={data}
                tags={recipe.tags ?? []}
                images={recipe.images}
              />
            </div>
          </div>

          {/* Tags */}
          {(recipe.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {(recipe.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--card)',
                    color: 'var(--tag-color)',
                    border: '1px solid var(--tag-border)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(1.9rem, 5vw, 3rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              color: 'var(--foreground)',
            }}
          >
            {recipe.title}
          </h1>

          {/* Source */}
          {data.source && (() => {
            const isUrl = /^https?:\/\//i.test(data.source);
            if (isUrl) {
              let label = data.source;
              try { label = new URL(data.source).hostname.replace(/^www\./, ''); } catch { /* keep */ }
              return (
                <p className="mt-3 flex items-center gap-1.5" style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                  <ExternalLink size={13} strokeWidth={1.5} />
                  <a href={data.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {label}
                  </a>
                </p>
              );
            }
            return (
              <p className="mt-2" style={{ fontSize: '14px', color: 'var(--foreground-muted)' }}>
                {data.source}
              </p>
            );
          })()}

          {/* Attribution */}
          {recipe.sourceAttribution && (
            <p className="mt-3 flex items-center gap-1.5" style={{ fontSize: '13px', color: 'var(--foreground-muted)', fontStyle: 'italic' }}>
              {recipe.sourceAttribution}
            </p>
          )}

          {/* Description */}
          {data.description && (
            <p
              className="mt-5 leading-relaxed"
              style={{ color: 'var(--foreground-muted)', fontSize: '16px', maxWidth: '65ch' }}
            >
              {data.description}
            </p>
          )}

          {/* Stats row */}
          <div
            className="flex flex-wrap items-center gap-6 mt-8 pt-6"
            style={{ borderTop: '1px solid var(--tag-border)' }}
          >
            {totalTime && (
              <div className="flex items-center gap-2.5">
                <Clock size={18} strokeWidth={1.5} style={{ color: 'var(--tag-color)', opacity: 0.8 }} />
                <div>
                  <div className="font-display font-semibold" style={{ fontSize: '22px', lineHeight: 1 }}>
                    {totalTime}
                    <span style={{ fontSize: '13px', fontWeight: 400, marginLeft: 3, fontFamily: 'Lato, sans-serif' }}>min</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: 2 }}>
                    {data.prepTime ? `${data.prepTime} prep` : ''}
                    {data.prepTime && data.cookTime ? ' · ' : ''}
                    {data.cookTime ? `${data.cookTime} cook` : ''}
                  </div>
                </div>
              </div>
            )}

            {data.servings && (
              <>
                {totalTime && <div style={{ width: 1, height: 32, background: 'var(--tag-border)' }} />}
                <div className="flex items-center gap-2.5">
                  <Users size={18} strokeWidth={1.5} style={{ color: 'var(--tag-color)', opacity: 0.8 }} />
                  <div>
                    <div className="font-display font-semibold" style={{ fontSize: '22px', lineHeight: 1 }}>
                      {data.servings}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: 2 }}>servings</div>
                  </div>
                </div>
              </>
            )}

            {!totalTime && !data.servings && (
              <div className="flex items-center gap-2" style={{ color: 'var(--foreground-faint)', fontSize: '14px' }}>
                <ChefHat size={16} strokeWidth={1.5} />
                <span>Edit to add time &amp; servings</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PHOTOS ── */}
      <div className="page-container" style={{ paddingTop: 48 }}>
        {hasPhotos && (
          <div
            className="mb-3"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 16px rgba(44,36,22,0.09)',
            }}
          >
            <ImageCarousel height={480} images={recipe.images} />
          </div>
        )}
        <div className={hasPhotos ? 'flex justify-end' : ''}>
          <SectionEditPhotos
            recipeId={recipe.id}
            images={recipe.images}
            tags={recipe.tags ?? []}
          />
        </div>
      </div>

      {/* ── BRANCH TABS ── */}
      {recipe.branches.length > 0 && (
        <div className="mt-10">
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
        <div className="page-container mt-10 flex flex-col gap-10">
          {data.ingredients.length > 0 && (
            <IngredientsSection
              ingredients={data.ingredients}
              servings={data.servings}
              editAction={
                <SectionEditIngredients
                  recipeId={recipe.id}
                  branchId={activeBranch?.id}
                  data={data}
                  tags={recipe.tags ?? []}
                  images={recipe.images}
                />
              }
            />
          )}
          {data.instructions.length > 0 && (
            <CookModeInstructions
              instructions={data.instructions}
              editAction={
                <SectionEditInstructions
                  recipeId={recipe.id}
                  branchId={activeBranch?.id}
                  data={data}
                  tags={recipe.tags ?? []}
                  images={recipe.images}
                />
              }
            />
          )}
        </div>
      )}

      {/* ── NOTES ── */}
      {data.notes && (
        <div className="page-container" style={{ paddingTop: 56 }}>
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'var(--gold-light)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid var(--gold)`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-label">Chef's Notes</h2>
              <SectionEditNotes
                recipeId={recipe.id}
                branchId={activeBranch?.id}
                data={data}
                tags={recipe.tags ?? []}
                images={recipe.images}
              />
            </div>
            <p className="leading-relaxed whitespace-pre-wrap font-display italic" style={{ fontSize: '16px', color: 'var(--foreground)' }}>
              {data.notes}
            </p>
          </div>
        </div>
      )}

      {/* ── VERSION HISTORY ── */}
      <div className="page-container mt-16 mb-4">
        <div className="ornament-divider mb-8" aria-hidden="true">✦</div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <h2 className="section-label">
                Version History
              </h2>
              {activeBranch && !activeBranch.isDefault && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {activeBranch.name}
                </span>
              )}
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--gold-light)', color: 'var(--gold)' }}
              >
                {branchVersions.length}
              </span>
            </div>
            <Link
              href={versionsHref}
              className="text-sm font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              See all →
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
                    className="flex items-center gap-4 px-5 py-4 transition-colors"
                    style={{
                      background: isCurrent ? 'var(--accent-light)' : 'var(--card)',
                    }}
                  >
                    <span
                      className="font-display font-semibold flex-shrink-0 w-8 text-center"
                      style={{ color: isCurrent ? 'var(--accent)' : 'var(--foreground-faint)', fontSize: '15px' }}
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
                            className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'var(--accent)', color: 'white' }}
                          >
                            current
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {new Date(v.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ color: 'var(--foreground-faint)', flexShrink: 0 }}>
                      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="page-container mt-4 pb-12">
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <DeleteRecipeButton id={recipe.id} title={recipe.title} />
        </div>
      </div>
    </div>
  );
}
