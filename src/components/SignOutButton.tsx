"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        color: "var(--foreground-faint)",
        fontSize: "13px",
        letterSpacing: "0.03em",
      }}
    >
      Sign out
    </button>
  );
}
