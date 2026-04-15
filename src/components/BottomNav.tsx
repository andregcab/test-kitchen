"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, LogOut, Plus } from "lucide-react";

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
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-6 border-t"
      style={{
        background: "rgba(255,250,242,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border)",
        paddingTop: "10px",
        paddingBottom: "max(14px, env(safe-area-inset-bottom))",
        zIndex: 50,
      }}
    >
      {/* Recipes tab — pill expands on active */}
      <Link
        href="/recipes"
        className="flex items-center rounded-2xl overflow-hidden"
        style={{
          color: isRecipes ? "var(--accent)" : "var(--muted)",
          background: isRecipes ? "var(--accent-light)" : "transparent",
          padding: "10px 14px",
          gap: "8px",
          transition: "background 250ms ease, color 250ms ease",
        }}
      >
        <ChefHat
          size={24}
          strokeWidth={isRecipes ? 2.2 : 1.8}
          style={{ flexShrink: 0, transition: "stroke-width 250ms ease" }}
        />
        <span
          style={{
            maxWidth: isRecipes ? "72px" : "0px",
            opacity: isRecipes ? 1 : 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: "14px",
            fontWeight: 700,
            transition: "max-width 280ms ease, opacity 200ms ease",
          }}
        >
          Recipes
        </span>
      </Link>

      {/* Add recipe FAB */}
      <Link
        href="/recipes/new"
        className="flex items-center justify-center w-14 h-14 rounded-full text-white transition-all active:scale-95"
        style={{
          background: "var(--accent)",
          boxShadow: "0 4px 14px rgba(192, 74, 18, 0.40)",
        }}
        aria-label="Add recipe"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>

      {/* Sign out — icon only */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center p-3 rounded-2xl transition-all"
        style={{ color: "var(--muted)" }}
        aria-label="Sign out"
      >
        <LogOut size={24} strokeWidth={1.8} />
      </button>
    </nav>
  );
}
