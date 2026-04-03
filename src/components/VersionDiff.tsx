import { Change } from "@/lib/diff";

const kindConfig = {
  added: { label: "Added", bg: "#f0fdf4", border: "#86efac", dot: "#16a34a" },
  removed: { label: "Removed", bg: "#fef2f2", border: "#fca5a5", dot: "#dc2626" },
  changed: { label: "Changed", bg: "#fffbeb", border: "#fcd34d", dot: "#d97706" },
};

export default function VersionDiff({ changes }: { changes: Change[] }) {
  if (changes.length === 0) {
    return (
      <div
        className="p-5 rounded-2xl text-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <p style={{ color: "var(--muted)" }}>No differences from the previous version.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {changes.map((change, i) => {
        const cfg = kindConfig[change.kind];
        return (
          <li
            key={i}
            className="p-4 rounded-xl"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cfg.dot }}
              />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg.dot }}>
                {cfg.label}
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {change.field}
              </span>
            </div>

            {change.kind === "changed" && (
              <div className="ml-4 flex flex-col gap-1 text-sm">
                <div className="flex gap-2">
                  <span style={{ color: "#dc2626" }} className="font-medium w-12 flex-shrink-0">Before:</span>
                  <span style={{ color: "var(--foreground)" }}>{change.from}</span>
                </div>
                <div className="flex gap-2">
                  <span style={{ color: "#16a34a" }} className="font-medium w-12 flex-shrink-0">After:</span>
                  <span style={{ color: "var(--foreground)" }}>{change.to}</span>
                </div>
              </div>
            )}

            {change.kind === "added" && (
              <p className="ml-4 text-sm" style={{ color: "var(--foreground)" }}>{change.to}</p>
            )}

            {change.kind === "removed" && (
              <p className="ml-4 text-sm line-through" style={{ color: "var(--muted)" }}>{change.from}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
