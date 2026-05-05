import Link from "next/link";
import { ChefHat, Plus, User } from "lucide-react";

export default function TopHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--nav-border)',
      }}
    >
      <div
        className="page-container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}
      >
        <Link
          href="/recipes"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--foreground)' }}
        >
          <ChefHat size={20} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
          <span className="font-display" style={{ fontSize: '18px', fontWeight: 600 }}>
            Test Kitchen
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/recipes/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 12,
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Recipe
          </Link>
          <Link
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
              textDecoration: 'none',
            }}
            aria-label="Profile & settings"
          >
            <User size={18} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </header>
  );
}
