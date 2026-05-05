"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, Plus, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function cycleTheme() {
    const order: Array<typeof theme> = ["system", "light", "dark"];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  }

  const isRecipes = pathname === "/recipes" || pathname.startsWith("/recipes/");

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const themeLabel = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Auto";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-6 border-t"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--nav-border)",
        paddingTop: "10px",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        zIndex: 50,
      }}
    >
      {/* Recipes tab */}
      <Link
        href="/recipes"
        className="flex items-center rounded-2xl overflow-hidden"
        style={{
          color: isRecipes ? "var(--accent)" : "var(--foreground-muted)",
          background: isRecipes ? "var(--accent-light)" : "transparent",
          padding: "10px 14px",
          gap: "8px",
          transition: "background 250ms ease, color 250ms ease",
        }}
      >
        <ChefHat
          size={24}
          strokeWidth={isRecipes ? 2.2 : 1.6}
          style={{ flexShrink: 0, transition: "stroke-width 250ms ease" }}
        />
        <span
          style={{
            fontFamily: "'Lato', sans-serif",
            maxWidth: isRecipes ? "72px" : "0px",
            opacity: isRecipes ? 1 : 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.04em",
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
          boxShadow: "0 4px 16px rgba(74, 103, 65, 0.35)",
        }}
        aria-label="Add recipe"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>

      {/* Theme toggle — labeled so it's legible */}
      <button
        onClick={cycleTheme}
        className="flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all"
        style={{ color: "var(--foreground-muted)" }}
        aria-label={`Appearance: ${themeLabel}. Tap to change.`}
      >
        <ThemeIcon size={20} strokeWidth={1.6} />
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", opacity: 0.7 }}>
          {themeLabel}
        </span>
      </button>
    </nav>
  );
}
