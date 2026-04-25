import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function NewRecipePage() {
  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href="/recipes" />
        <h1 className="text-2xl font-bold">Add Recipe</h1>
      </div>

      <p className="text-lg mb-6" style={{ color: "var(--muted)" }}>
        How would you like to add this recipe?
      </p>

      <div className="flex flex-col gap-4">
        {/* URL import — live */}
        <Link
          href="/recipes/new/import/url"
          className="flex items-center gap-5 p-6 rounded-2xl border-2 transition-colors hover:border-[var(--accent)]"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <span className="text-4xl">🔗</span>
          <div>
            <p className="text-xl font-semibold">From a website</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
              Paste a link and we&apos;ll pull the recipe automatically
            </p>
          </div>
          <span className="ml-auto text-2xl" style={{ color: "var(--muted)" }}>›</span>
        </Link>

        {/* Photo import */}
        <Link
          href="/recipes/new/import/photo"
          className="flex items-center gap-5 p-6 rounded-2xl border-2 transition-colors hover:border-[var(--accent)]"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <span className="text-4xl">📷</span>
          <div>
            <p className="text-xl font-semibold">From a photo</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
              Take a picture of a cookbook page or recipe card
            </p>
          </div>
          <span className="ml-auto text-2xl" style={{ color: "var(--muted)" }}>›</span>
        </Link>

        {/* Manual entry */}
        <div className="relative flex items-center gap-3 my-2">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-sm" style={{ color: "var(--muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <Link
          href="/recipes/new/manual"
          className="flex items-center gap-5 p-6 rounded-2xl border-2 transition-colors hover:border-[var(--accent)]"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <span className="text-4xl">✏️</span>
          <div>
            <p className="text-xl font-semibold">Type it in</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
              Enter the recipe yourself from scratch
            </p>
          </div>
          <span className="ml-auto text-2xl" style={{ color: "var(--muted)" }}>›</span>
        </Link>
      </div>
    </div>
  );
}
