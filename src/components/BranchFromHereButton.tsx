'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch } from 'lucide-react';

interface Props {
  recipeId: string;
  versionId: string;
  versionNumber: number;
}

export default function BranchFromHereButton({ recipeId, versionId, versionNumber }: Props) {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  async function create() {
    if (!name.trim() || creating) return;
    setCreating(true);
    const res = await fetch(`/api/recipes/${recipeId}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), createdFromVersionId: versionId }),
    });
    if (res.ok) {
      const branch = await res.json();
      router.push(`/recipes/${recipeId}?branch=${branch.id}`);
      router.refresh();
    }
    setCreating(false);
  }

  if (showInput) {
    return (
      <div
        className='flex flex-col gap-2 p-4 rounded-2xl border min-w-[280px]'
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <p className='text-xs font-semibold' style={{ color: 'var(--muted)' }}>
          New variation from v{versionNumber}
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') create();
            if (e.key === 'Escape') { setShowInput(false); setName(''); }
          }}
          placeholder='e.g. Vegetarian, Lactose-Free…'
          className='px-3 py-2 rounded-xl border-2 text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]'
          style={{ borderColor: 'var(--border)' }}
        />
        <div className='flex gap-2'>
          <button
            onClick={create}
            disabled={creating || !name.trim()}
            className='flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50'
            style={{ background: 'var(--accent)' }}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
          <button
            onClick={() => { setShowInput(false); setName(''); }}
            className='px-3 py-2 rounded-xl text-sm'
            style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className='flex items-center justify-center gap-2 px-4 rounded-2xl border text-sm font-medium transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]'
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--muted)',
        minWidth: 44,
      }}
      title={`New variation from v${versionNumber}`}
    >
      <GitBranch size={16} strokeWidth={1.8} />
    </button>
  );
}
