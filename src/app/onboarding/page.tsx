'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(displayName: string | null) {
    setSaving(true);
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    router.push('/recipes');
  }

  return (
    <main
      className="flex items-center justify-center min-h-screen p-6"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full max-w-sm text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center"
          style={{ background: 'var(--accent-light)', border: '2px solid var(--border)' }}
        >
          <span style={{ fontSize: 36 }}>🍳</span>
        </div>

        <h1
          className="font-display"
          style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 }}
        >
          What do we call you?
        </h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '16px', marginBottom: 36 }}>
          We'll use this to personalize your kitchen.
          <br />You can change it anytime.
        </p>

        <div
          className="rounded-2xl p-8 text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 20px rgba(44,36,22,0.08)' }}
        >
          <label className="section-label block mb-2">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && save(name.trim())}
            placeholder="e.g. Margaret"
            autoFocus
            autoCapitalize="words"
            autoCorrect="off"
            className="w-full px-4 rounded-xl border-2 text-base outline-none transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />

          <button
            onClick={() => save(name.trim() || null)}
            disabled={saving}
            className="w-full py-4 text-base font-semibold text-white rounded-xl disabled:opacity-60 mt-4"
            style={{ background: 'var(--accent)' }}
          >
            {saving ? 'Saving…' : name.trim() ? `Let's go, ${name.trim()}` : "Let's go"}
          </button>
        </div>

        <button
          onClick={() => save(null)}
          className="mt-5 text-sm"
          style={{ color: 'var(--foreground-faint)' }}
        >
          Skip for now
        </button>
      </div>
    </main>
  );
}
