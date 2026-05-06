'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DisplayNameForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (name === currentName) return;
    setSaving(true);
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: name }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div>
      <label className="section-label block mb-2">Your name</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Margaret"
          autoCapitalize="words"
          autoCorrect="off"
          className="flex-1 px-4 rounded-xl border-2 text-base outline-none transition-colors"
          style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={handleSave}
          disabled={saving || name === currentName}
          className="px-4 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{
            background: saved ? 'var(--accent-light)' : 'var(--accent)',
            color: saved ? 'var(--accent)' : 'white',
            border: saved ? '1px solid var(--accent)' : 'none',
            transition: 'all 200ms ease',
            minWidth: 64,
          }}
        >
          {saving ? '…' : saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
