import Link from "next/link";
import BackButton from "@/components/BackButton";
import { ChevronRight } from "lucide-react";

export default function NewRecipePage() {
  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-4 mb-10">
        <BackButton href="/recipes" />
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
            Add a Recipe
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '15px' }}>
            How would you like to add it?
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-lg">
        <Link
          href="/recipes/new/import/url"
          className="flex items-center gap-5 p-5 rounded-2xl border transition-all active:scale-[0.99]"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-light)', fontSize: 22 }}
          >
            🔗
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold" style={{ fontSize: '17px' }}>From a website</p>
            <p style={{ color: "var(--foreground-muted)", fontSize: '14px', marginTop: 2 }}>
              Paste a link from a recipe site or YouTube video
            </p>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} style={{ color: 'var(--foreground-faint)', flexShrink: 0 }} />
        </Link>

        <Link
          href="/recipes/new/import/photo"
          className="flex items-center gap-5 p-5 rounded-2xl border transition-all active:scale-[0.99]"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-light)', fontSize: 22 }}
          >
            📷
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold" style={{ fontSize: '17px' }}>From a photo</p>
            <p style={{ color: "var(--foreground-muted)", fontSize: '14px', marginTop: 2 }}>
              Take a picture of a cookbook page or recipe card
            </p>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} style={{ color: 'var(--foreground-faint)', flexShrink: 0 }} />
        </Link>

        <div className="ornament-divider my-1" aria-hidden="true">or</div>

        <Link
          href="/recipes/new/manual"
          className="flex items-center gap-5 p-5 rounded-2xl border transition-all active:scale-[0.99]"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--surface)', fontSize: 22 }}
          >
            ✏️
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold" style={{ fontSize: '17px' }}>Type it in</p>
            <p style={{ color: "var(--foreground-muted)", fontSize: '14px', marginTop: 2 }}>
              Enter the recipe yourself from scratch
            </p>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} style={{ color: 'var(--foreground-faint)', flexShrink: 0 }} />
        </Link>
      </div>
    </div>
  );
}
