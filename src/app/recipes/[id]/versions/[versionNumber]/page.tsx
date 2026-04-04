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
    include: {
      versions: { orderBy: { versionNumber: "asc" } },
    },
  });

  if (!recipe) notFound();

  const version = recipe.versions.find((v) => v.versionNumber === vNum);
  if (!version) notFound();

  const data = version.data as unknown as RecipeData;
  const isCurrent = version.id === recipe.currentVersionId;

  // Find the previous version for diffing
  const prevVersion = recipe.versions.find((v) => v.versionNumber === vNum - 1);
  const prevData = prevVersion
    ? (prevVersion.data as unknown as RecipeData)
    : null;

  const changes = prevData ? diffRecipes(prevData, data) : [];
  const totalTime = (data.prepTime ?? 0) + (data.cookTime ?? 0) || null;

  const allVersionNums = recipe.versions.map((v) => v.versionNumber);
  const prevNum = allVersionNums.filter((n) => n < vNum).at(-1) ?? null;
  const nextNum = allVersionNums.find((n) => n > vNum) ?? null;

  return (
    <div className="px-[150px] py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton href={`/recipes/${id}/versions`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Version {vNum}</h1>
            {isCurrent && (
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "var(--accent)", color: "white" }}
              >
                current
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {new Date(version.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Prev / Next navigation */}
      {(prevNum !== null || nextNum !== null) && (
        <div className="flex gap-2 mb-6">
          {prevNum !== null ? (
            <Link
              href={`/recipes/${id}/versions/${prevNum}`}
              className="flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold rounded-xl border"
              style={{ borderColor: "var(--border)" }}
            >
              ‹ v{prevNum}
            </Link>
          ) : <div className="flex-1" />}
          {nextNum !== null ? (
            <Link
              href={`/recipes/${id}/versions/${nextNum}`}
              className="flex items-center justify-center gap-1.5 flex-1 py-3 text-sm font-semibold rounded-xl border"
              style={{ borderColor: "var(--border)" }}
            >
              v{nextNum} ›
            </Link>
          ) : <div className="flex-1" />}
        </div>
      )}

      {/* Change note — editable */}
      <EditChangeNote
        recipeId={id}
        versionNumber={vNum}
        initial={version.changeNote}
      />

      {/* Diff vs previous version */}
      {prevVersion && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            What changed from v{prevVersion.versionNumber}
          </h2>
          <VersionDiff changes={changes} />
        </section>
      )}

      {!prevVersion && (
        <div
          className="p-4 rounded-2xl mb-6 text-sm"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          This is the original version of the recipe.
        </div>
      )}

      {/* Restore button */}
      {!isCurrent && (
        <div className="mb-8">
          <RestoreVersionButton recipeId={id} versionNumber={vNum} />
        </div>
      )}

      {/* Full recipe snapshot */}
      <h2 className="text-xl font-bold mb-4">Full Recipe at This Version</h2>

      {/* Meta */}
      {(data.prepTime || data.cookTime || data.servings) && (
        <div
          className="flex gap-6 p-4 rounded-2xl mb-6 text-sm font-medium"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {totalTime && (
            <div className="text-center">
              <div className="text-2xl font-bold">{totalTime}</div>
              <div style={{ color: "var(--muted)" }}>min total</div>
            </div>
          )}
          {data.prepTime && (
            <div className="text-center">
              <div className="text-2xl font-bold">{data.prepTime}</div>
              <div style={{ color: "var(--muted)" }}>min prep</div>
            </div>
          )}
          {data.cookTime && (
            <div className="text-center">
              <div className="text-2xl font-bold">{data.cookTime}</div>
              <div style={{ color: "var(--muted)" }}>min cook</div>
            </div>
          )}
          {data.servings && (
            <div className="text-center">
              <div className="text-2xl font-bold">{data.servings}</div>
              <div style={{ color: "var(--muted)" }}>servings</div>
            </div>
          )}
        </div>
      )}

      {data.description && (
        <p className="mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
          {data.description}
        </p>
      )}

      {data.ingredients.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3">Ingredients</h3>
          <ul className="flex flex-col gap-2">
            {data.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <span className="w-2 h-2 mt-2.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                <span>
                  <span className="font-medium">
                    {[ing.amount, ing.unit].filter(Boolean).join(" ")} {ing.name}
                  </span>
                  {ing.notes && (
                    <span className="ml-1 text-sm" style={{ color: "var(--muted)" }}>
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
          <h3 className="text-lg font-bold mb-3">Instructions</h3>
          <ol className="flex flex-col gap-3">
            {data.instructions.map((inst) => (
              <li
                key={inst.step}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
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
          <h3 className="text-lg font-bold mb-3">Notes</h3>
          <div
            className="p-4 rounded-xl whitespace-pre-wrap leading-relaxed"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {data.notes}
          </div>
        </section>
      )}
    </div>
  );
}
