import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import BranchFromHereButton from "@/components/BranchFromHereButton";

export const dynamic = "force-dynamic";

export default async function VersionHistoryPage({
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
      versions: { orderBy: { versionNumber: "desc" } },
      branches: { orderBy: { order: "asc" } },
    },
  });

  if (!recipe) notFound();

  const activeBranch = branchParam
    ? recipe.branches.find((b) => b.id === branchParam)
    : recipe.branches.find((b) => b.isDefault);

  const activeVersion = activeBranch?.currentVersionId;

  const versions = activeBranch
    ? recipe.versions.filter((v) => v.branchId === activeBranch.id)
    : recipe.versions;

  const backHref = activeBranch && !activeBranch.isDefault
    ? `/recipes/${id}?branch=${activeBranch.id}`
    : `/recipes/${id}`;

  const branchCount = recipe.branches.length;
  const canBranch = branchCount < 5;

  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href={backHref} />
        <div>
          <h1 className="text-2xl font-bold">Version History</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {recipe.title}
            {activeBranch && !activeBranch.isDefault && (
              <span
                className="ml-2 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {activeBranch.name}
              </span>
            )}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {versions.map((v) => {
          const isCurrent = v.id === activeVersion;
          const versionHref = activeBranch && !activeBranch.isDefault
            ? `/recipes/${id}/versions/${v.versionNumber}?branch=${activeBranch.id}`
            : `/recipes/${id}/versions/${v.versionNumber}`;

          return (
            <li key={v.id} className="flex items-stretch gap-3">
              <Link
                href={versionHref}
                className="flex-1 flex items-center gap-4 p-5 rounded-2xl border transition-colors hover:border-[var(--accent)]"
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

              {/* Branch from this version */}
              {canBranch && (
                <BranchFromHereButton
                  recipeId={id}
                  versionId={v.id}
                  versionNumber={v.versionNumber}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
