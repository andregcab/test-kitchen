"use client";

import { useState, useEffect } from "react";

interface Menu {
  id: string;
  name: string;
}

interface Props {
  recipeId: string;
  initialMenuIds: string[];
}

export default function MenuPicker({ recipeId, initialMenuIds }: Props) {
  const [open, setOpen] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set(initialMenuIds));
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open && menus.length === 0) {
      fetch("/api/menus").then((r) => r.json()).then(setMenus);
    }
  }, [open, menus.length]);

  async function toggle(menuId: string) {
    const inMenu = memberIds.has(menuId);
    const method = inMenu ? "DELETE" : "PUT";
    await fetch(`/api/menus/${menuId}/recipes/${recipeId}`, { method });
    setMemberIds((prev) => {
      const next = new Set(prev);
      inMenu ? next.delete(menuId) : next.add(menuId);
      return next;
    });
  }

  async function createMenu() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const menu = await res.json();
    setMenus((prev) => [...prev, menu]);
    setNewName("");
    setCreating(false);
    // Immediately add this recipe to the new menu
    await toggle(menu.id);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="3" width="14" height="2" rx="1" fill="currentColor" />
          <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" />
          <rect x="1" y="11" width="9" height="2" rx="1" fill="currentColor" />
        </svg>
        Add to Menu
        {memberIds.size > 0 && (
          <span
            className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {memberIds.size}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-2 z-20 rounded-2xl shadow-lg overflow-hidden min-w-[220px]"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {menus.length === 0 && (
              <p className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>
                No menus yet
              </p>
            )}
            {menus.map((menu) => {
              const active = memberIds.has(menu.id);
              return (
                <button
                  key={menu.id}
                  onClick={() => toggle(menu.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-[var(--background)]"
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: active ? "var(--accent)" : "transparent",
                      border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    {active && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {menu.name}
                </button>
              );
            })}
            <div
              className="flex gap-2 px-3 py-3"
              style={{ borderTop: menus.length > 0 ? "1px solid var(--border)" : "none" }}
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createMenu()}
                placeholder="New menu…"
                className="flex-1 px-3 py-2 text-sm rounded-xl border outline-none focus:border-[var(--accent)]"
                style={{ borderColor: "var(--border)", background: "var(--background)" }}
              />
              <button
                onClick={createMenu}
                disabled={creating || !newName.trim()}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
