"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isRecipes = pathname === "/recipes" || pathname.startsWith("/recipes/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 border-t"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <Link
        href="/recipes"
        className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
        style={{ color: isRecipes ? "var(--accent)" : "var(--muted)" }}
      >
        <span className="text-2xl">📖</span>
        <span className="text-xs font-medium">Recipes</span>
      </Link>

      <Link
        href="/recipes/new"
        className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-md"
        style={{ background: "var(--accent)" }}
        aria-label="Add recipe"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 3V19M3 11H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </Link>

      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl"
        style={{ color: "var(--muted)" }}
      >
        <span className="text-2xl">🚪</span>
        <span className="text-xs font-medium">Sign Out</span>
      </button>
    </nav>
  );
}
