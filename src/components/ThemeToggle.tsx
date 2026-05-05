"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'Auto',  Icon: Monitor },
  { value: 'dark',   label: 'Dark',  Icon: Moon },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 12,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent-light)' : 'var(--card)',
              color: active ? 'var(--accent)' : 'var(--foreground-muted)',
              fontWeight: active ? 700 : 400,
              fontSize: '14px',
              transition: 'all 200ms ease',
              cursor: 'pointer',
            }}
            aria-pressed={active}
          >
            <Icon size={15} strokeWidth={active ? 2.2 : 1.6} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
