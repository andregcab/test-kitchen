import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RecipeData } from "@/lib/types";
import { diffRecipes } from "@/lib/diff";
import VersionDiff from "@/components/VersionDiff";
import RestoreVersionButton from "@/components/RestoreVersionButton";
import EditChangeNote from "@/components/EditChangeNote";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function VersionDetailPage({
  params,
}: {
  params: Promise<{ id: string; versionNumber: string }>;
}) {
  const { id, versionNumber } = await params;
  const vNum = parseInt(versionNumber, 10);

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "asc" } } },
  });

  if (!recipe) notFound();

  const version = recipe.versions.find((v) => v.versionNumber === vNum);
  if (!version) notFound();

  const data = version.data as unknown as RecipeData;
  const isCurrent = version.id === recipe.currentVersionId;

  const prevVersion = recipe.versions.find((v) => v.versionNumber === vNum - 1);
  const prevData = prevVersion ? (prevVersion.data as unknown as RecipeData) : null;
  const changes = prevData ? diffRecipes(prevData, data) : [];
  const totalTime = (data.prepTime ?? 0) + (data.cookTime ?? 0) || null;

  const allVersionNums = recipe.versions.map((v) => v.versionNumber);
  const prevNum = allVersionNums.filter((n) => n < vNum).at(-1) ?? null;
  const nextNum = allVersionNums.find((n) => n > vNum) ?? null;

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton href={`/recipes/${id}/versions`} />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
              Version {vNum}
            </h1>
            {isCurrent && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: "var(--accent)", color: "white" }}
              >
                current
              </span>
            )}
          </div>
          <p className="mt-0.5" style={{ color: "var(--foreground-muted)", fontSize: '15px' }}>
            {new Date(version.createdAt).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Version navigation */}
      {(prevNum !== null || nextNum !== null) && (
        <div className="flex gap-2 mb-8">
          {prevNum !== null ? (
            <Link
              href={`/recipes/${id}/versions/${prevNum}`}
              className="flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold rounded-xl border transition-all"
              style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
            >
              ‹ v{prevNum}
            </Link>
          ) : <div className="flex-1" />}
          {nextNum !== null ? (
            <Link
              href={`/recipes/${id}/versions/${nextNum}`}
              className="flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold rounded-xl border transition-all"
              style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
            >
              v{nextNum} ›
            </Link>
          ) : <div className="flex-1" />}
        </div>
      )}

      {/* Change note */}
      <EditChangeNote recipeId={id} versionNumber={vNum} initial={version.changeNote} />

      {/* Diff */}
      {prevVersion && (
        <section className="mb-8">
          <h2 className="font-display font-semibold mb-4" style={{ fontSize: '1.25rem' }}>
            What changed from v{prevVersion.versionNumber}
          </h2>
          <VersionDiff changes={changes} />
        </section>
      )}

      {!prevVersion && (
        <div
          className="p-4 rounded-2xl mb-6 text-sm"
          style={{ background: "var(--gold-light)", border: "1px solid var(--border)", borderLeft: "3px solid var(--gold)", color: "var(--foreground-muted)" }}
        >
          This is the original version of the recipe.
        </div>
      )}

      {/* Restore */}
      {!isCurrent && (
        <div className="mb-10">
          <RestoreVersionButton recipeId={id} versionNumber={vNum} />
        </div>
      )}

      <div className="ornament-divider mb-8" aria-hidden="true">✦</div>

      {/* Full recipe snapshot */}
      <h2 className="font-display font-semibold mb-6" style={{ fontSize: '1.25rem' }}>
        Full Recipe at This Version
      </h2>

      {(data.prepTime || data.cookTime || data.servings) && (
        <div
          className="flex flex-wrap gap-8 p-5 rounded-2xl mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {totalTime && (
            <div>
              <div className="font-display font-semibold" style={{ fontSize: '28px', lineHeight: 1 }}>{totalTime}</div>
              <div className="section-label mt-1">min total</div>
            </div>
          )}
          {data.prepTime && (
            <div>
              <div className="font-display font-semibold" style={{ fontSize: '28px', lineHeight: 1 }}>{data.prepTime}</div>
              <div className="section-label mt-1">min prep</div>
            </div>
          )}
          {data.cookTime && (
            <div>
              <div className="font-display font-semibold" style={{ fontSize: '28px', lineHeight: 1 }}>{data.cookTime}</div>
              <div className="section-label mt-1">min cook</div>
            </div>
          )}
          {data.servings && (
            <div>
              <div className="font-display font-semibold" style={{ fontSize: '28px', lineHeight: 1 }}>{data.servings}</div>
              <div className="section-label mt-1">servings</div>
            </div>
          )}
        </div>
      )}

      {data.description && (
        <p className="mb-6 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          {data.description}
        </p>
      )}

      {data.ingredients.length > 0 && (
        <section className="mb-8">
          <h3 className="section-label mb-4">Ingredients</h3>
          <ul className="flex flex-col gap-2">
            {data.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <span className="w-1.5 h-1.5 mt-2.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                <span>
                  <span className="font-medium">
                    {[ing.amount, ing.unit].filter(Boolean).join(" ")} {ing.name}
                  </span>
                  {ing.notes && (
                    <span className="ml-1.5 text-sm" style={{ color: "var(--foreground-muted)" }}>
                      ({ing.notes})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.instructions.length > 0 && (
        <section className="mb-8">
          <h3 className="section-label mb-4">Instructions</h3>
          <ol className="flex flex-col gap-3">
            {data.instructions.map((inst) => (
              <li
                key={inst.step}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ background: "var(--accent)" }}
                >
                  {inst.step}
                </span>
                <p className="pt-0.5 leading-relaxed">{inst.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {data.notes && (
        <section className="mb-8">
          <h3 className="section-label mb-3">Notes</h3>
          <div
            className="p-5 rounded-2xl whitespace-pre-wrap leading-relaxed font-display italic"
            style={{ background: "var(--gold-light)", border: "1px solid var(--border)", borderLeft: "3px solid var(--gold)", fontSize: '16px' }}
          >
            {data.notes}
          </div>
        </section>
      )}
    </div>
  );
}
