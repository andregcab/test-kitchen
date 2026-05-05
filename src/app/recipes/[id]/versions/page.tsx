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

  const activeVersionId = activeBranch?.currentVersionId;

  const versions = activeBranch
    ? recipe.versions.filter((v) => v.branchId === activeBranch.id)
    : recipe.versions;

  const backHref = activeBranch && !activeBranch.isDefault
    ? `/recipes/${id}?branch=${activeBranch.id}`
    : `/recipes/${id}`;

  const canBranch = recipe.branches.length < 5;

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-4 mb-8">
        <BackButton href={backHref} />
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
            Version History
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--foreground-muted)' }}>
            {recipe.title}
            {activeBranch && !activeBranch.isDefault && (
              <span
                className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
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
          const isCurrent = v.id === activeVersionId;
          const versionHref = activeBranch && !activeBranch.isDefault
            ? `/recipes/${id}/versions/${v.versionNumber}?branch=${activeBranch.id}`
            : `/recipes/${id}/versions/${v.versionNumber}`;

          return (
            <li key={v.id} className="flex items-stretch gap-3">
              <Link
                href={versionHref}
                className="flex-1 flex items-center gap-4 p-5 rounded-2xl border transition-all active:scale-[0.99]"
                style={{
                  background: "var(--card)",
                  borderColor: isCurrent ? "var(--accent)" : "var(--border)",
                  boxShadow: isCurrent ? "0 0 0 1px var(--accent)" : "none",
                }}
              >
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-display font-semibold"
                  style={{
                    background: isCurrent ? "var(--accent)" : "var(--surface)",
                    color: isCurrent ? "white" : "var(--foreground-muted)",
                    fontSize: '14px',
                    border: `1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  v{v.versionNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate" style={{ fontSize: '15px' }}>
                      {v.changeNote ?? "No change note"}
                    </p>
                    {isCurrent && (
                      <span
                        className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "var(--accent)", color: "white" }}
                      >
                        current
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    {new Date(v.createdAt).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ color: 'var(--foreground-faint)', flexShrink: 0 }}>
                  <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

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
