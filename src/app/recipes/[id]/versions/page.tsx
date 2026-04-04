import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function VersionHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });

  if (!recipe) notFound();

  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href={`/recipes/${id}`} />
        <div>
          <h1 className="text-2xl font-bold">Version History</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {recipe.title}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {recipe.versions.map((v) => {
          const isCurrent = v.id === recipe.currentVersionId;
          return (
            <li key={v.id}>
              <Link
                href={`/recipes/${id}/versions/${v.versionNumber}`}
                className="flex items-center gap-4 p-5 rounded-2xl border transition-colors hover:border-[var(--accent)]"
                style={{
                  background: "var(--card)",
                  borderColor: isCurrent ? "var(--accent)" : "var(--border)",
                }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: isCurrent ? "var(--accent)" : "var(--border)",
                    color: isCurrent ? "white" : "var(--muted)",
                  }}
                >
                  v{v.versionNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
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
                  <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                    {new Date(v.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-2xl" style={{ color: "var(--muted)" }}>›</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
