import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RecipeData } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

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
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });

  if (!recipe || !recipe.currentVersion) notFound();

  const data = recipe.currentVersion.data as unknown as RecipeData;
  const totalTime = (data.prepTime ?? 0) + (data.cookTime ?? 0) || null;
  const color = getTagColor(recipe.tags ?? []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div
        className="relative px-4 pt-6 pb-8 mb-0"
        style={{ background: color.bg, borderBottom: `1px solid ${color.border}` }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <BackButton href="/recipes" />
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="flex items-center justify-center px-5 h-11 text-sm font-semibold rounded-xl"
            style={{ background: "rgba(255,255,255,0.7)", color: "var(--foreground)", border: `1px solid ${color.border}` }}
          >
            Edit
          </Link>
        </div>

        {/* Title & tags */}
        <div>
          {(recipe.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {(recipe.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.7)", color: "var(--foreground)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--foreground)" }}>
            {recipe.title}
          </h1>
          {data.description && (
            <p className="mt-2 text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.description}
            </p>
          )}
        </div>

        {/* Stats row */}
        {(totalTime || data.prepTime || data.cookTime || data.servings) && (
          <div className="flex gap-5 mt-5">
            {totalTime && (
              <div>
                <div className="text-2xl font-bold">{totalTime}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>min total</div>
              </div>
            )}
            {data.prepTime && (
              <div>
                <div className="text-2xl font-bold">{data.prepTime}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>prep</div>
              </div>
            )}
            {data.cookTime && (
              <div>
                <div className="text-2xl font-bold">{data.cookTime}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>cook</div>
              </div>
            )}
            {data.servings && (
              <div>
                <div className="text-2xl font-bold">{data.servings}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>servings</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-8 flex flex-col gap-8">
        {/* Ingredients */}
        {data.ingredients.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-3">Ingredients</h2>
            <ul className="flex flex-col gap-2">
              {data.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <span
                    className="w-2 h-2 mt-2 rounded-full flex-shrink-0"
                    style={{ background: "var(--accent)" }}
                  />
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

        {/* Instructions */}
        {data.instructions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-3">Instructions</h2>
            <ol className="flex flex-col gap-3">
              {data.instructions.map((inst) => (
                <li
                  key={inst.step}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <span
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "var(--accent)" }}
                  >
                    {inst.step}
                  </span>
                  <p className="pt-1 leading-relaxed">{inst.text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Notes */}
        {data.notes && (
          <section>
            <h2 className="text-lg font-bold mb-3">Notes</h2>
            <div
              className="p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-base"
              style={{ background: color.bg, border: `1px solid ${color.border}` }}
            >
              {data.notes}
            </div>
          </section>
        )}

        {/* Version history */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">
              Version History
              <span
                className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                style={{ background: "var(--border)", color: "var(--muted)" }}
              >
                {recipe.versions.length}
              </span>
            </h2>
            <Link
              href={`/recipes/${recipe.id}/versions`}
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              See all
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {recipe.versions.slice(0, 5).map((v) => {
              const isCurrent = v.id === recipe.currentVersionId;
              return (
                <li key={v.id}>
                  <Link
                    href={`/recipes/${recipe.id}/versions/${v.versionNumber}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: isCurrent ? "var(--accent-light)" : "var(--card)",
                      border: `1px solid ${isCurrent ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    <span
                      className="text-sm font-bold w-8 text-center flex-shrink-0"
                      style={{ color: isCurrent ? "var(--accent)" : "var(--muted)" }}
                    >
                      v{v.versionNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {v.changeNote ?? "No change note"}
                        {isCurrent && (
                          <span
                            className="ml-2 text-xs px-2 py-0.5 rounded-full align-middle"
                            style={{ background: "var(--accent)", color: "white" }}
                          >
                            current
                          </span>
                        )}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {new Date(v.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ color: "var(--muted)", flexShrink: 0 }}>
                      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Source */}
        {data.sourceUrl && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Source:{" "}
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              {data.sourceUrl}
            </a>
          </p>
        )}

        {/* Delete */}
        <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <DeleteRecipeButton id={recipe.id} title={recipe.title} />
        </div>
      </div>
    </div>
  );
}
