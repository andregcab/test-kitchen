'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeData } from '@/lib/types';
import BottomSheet from './BottomSheet';

const Pencil = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface Props {
  recipeId: string;
  branchId?: string;
  data: RecipeData;
  tags: string[];
  images: string[];
}

export default function SectionEditNotes({ recipeId, branchId, data, tags, images }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [saving, setSaving] = useState(false);

  function handleOpen() {
    setNotes(data.notes);
    setChangeNote('');
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { ...data, notes },
        tags,
        images,
        changeNote: changeNote.trim() || undefined,
        ...(branchId && { branchId }),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  const inputClass = 'w-full px-4 py-3 text-base rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]';
  const inputStyle = { borderColor: 'var(--border)' };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--border)]"
        style={{ color: 'var(--muted)' }}
        aria-label="Edit notes"
      >
        <Pencil />
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Edit Notes">
        <div className="flex flex-col gap-5 pb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tips, substitutions, things to try next time…"
              rows={6}
              className={inputClass}
              style={{ ...inputStyle, resize: 'vertical' }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              What changed?{' '}
              <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder='e.g. "Added tip about resting time"'
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-4 font-semibold rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-4 text-white font-semibold rounded-xl disabled:opacity-60" style={{ background: 'var(--accent)' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
