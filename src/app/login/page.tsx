"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/recipes");
    } else {
      setError("Incorrect password. Try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-sm"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👩‍🍳</div>
          <h1 className="text-3xl font-bold">Test Kitchen</h1>
          <p className="mt-1" style={{ color: "var(--muted)" }}>
            Your recipe collection
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-4 text-lg rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
            autoFocus
            required
          />

          {error && (
            <p className="text-sm text-center" style={{ color: "var(--accent)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-semibold text-white rounded-xl transition-opacity disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
