import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RecipeData } from "@/lib/types";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";

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
  const totalTime =
    (data.prepTime ?? 0) + (data.cookTime ?? 0) || null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/recipes"
          className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
          style={{ background: "var(--border)" }}
          aria-label="Back"
        >
          ‹
        </Link>
        <h1 className="text-2xl font-bold flex-1 leading-tight">{recipe.title}</h1>
        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="px-4 py-2 text-sm font-semibold rounded-xl border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          Edit
        </Link>
      </div>

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

      {/* Description */}
      {data.description && (
        <p className="mb-6 text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
          {data.description}
        </p>
      )}

      {/* Ingredients */}
      {data.ingredients.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Ingredients</h2>
          <ul className="flex flex-col gap-3">
            {data.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <span className="w-2 h-2 mt-3 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                <div>
                  <span className="font-medium">
                    {[ing.amount, ing.unit].filter(Boolean).join(" ")}{" "}
                    {ing.name}
                  </span>
                  {ing.notes && (
                    <span className="ml-1 text-sm" style={{ color: "var(--muted)" }}>
                      ({ing.notes})
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Instructions */}
      {data.instructions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="flex flex-col gap-4">
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
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Notes</h2>
          <div
            className="p-4 rounded-xl whitespace-pre-wrap leading-relaxed"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {data.notes}
          </div>
        </section>
      )}

      {/* Version history */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          Version History
          <span
            className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full"
            style={{ background: "var(--border)", color: "var(--muted)" }}
          >
            {recipe.versions.length}
          </span>
        </h2>
        <ul className="flex flex-col gap-2">
          {recipe.versions.map((v) => {
            const isCurrent = v.id === recipe.currentVersionId;
            return (
              <li
                key={v.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: isCurrent ? "var(--card)" : "transparent",
                  border: `1px solid ${isCurrent ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <span
                  className="text-sm font-bold w-8 text-center"
                  style={{ color: isCurrent ? "var(--accent)" : "var(--muted)" }}
                >
                  v{v.versionNumber}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {v.changeNote ?? "No change note"}
                    {isCurrent && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded-full"
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
              </li>
            );
          })}
        </ul>
      </section>

      {/* Tags */}
      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: "var(--border)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Source */}
      {data.sourceUrl && (
        <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
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

      {/* Danger zone */}
      <div
        className="p-4 rounded-2xl"
        style={{ border: "1px solid var(--border)" }}
      >
        <DeleteRecipeButton id={recipe.id} title={recipe.title} />
      </div>
    </div>
  );
}
