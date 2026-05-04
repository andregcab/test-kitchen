'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeData, Instruction } from '@/lib/types';
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

export default function SectionEditInstructions({ recipeId, branchId, data, tags, images }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [changeNote, setChangeNote] = useState('');
  const [saving, setSaving] = useState(false);

  function handleOpen() {
    setInstructions(data.instructions.map((i) => ({ ...i })));
    setChangeNote('');
    setOpen(true);
  }

  function update(i: number, text: string) {
    setInstructions((prev) => prev.map((inst, idx) => (idx === i ? { ...inst, text } : inst)));
  }

  function add() {
    const nextStep = (instructions[instructions.length - 1]?.step ?? 0) + 1;
    setInstructions((prev) => [...prev, { step: nextStep, text: '' }]);
  }

  function remove(i: number) {
    setInstructions((prev) =>
      prev.filter((_, idx) => idx !== i).map((inst, idx) => ({ ...inst, step: idx + 1 })),
    );
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { ...data, instructions },
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
        aria-label="Edit instructions"
      >
        <Pencil />
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Edit Instructions">
        <div className="flex flex-col gap-4 pb-4">
          {instructions.map((inst, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span
                className="flex-shrink-0 w-9 h-9 mt-1.5 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'var(--accent)' }}
              >
                {inst.step}
              </span>
              <textarea
                value={inst.text}
                onChange={(e) => update(i, e.target.value)}
                placeholder={`Step ${inst.step}…`}
                rows={3}
                className={`${inputClass} flex-1`}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl text-2xl leading-none"
                style={{ color: 'var(--muted)' }}
                aria-label="Remove step"
              >×</button>
            </div>
          ))}

          <button
            type="button"
            onClick={add}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-colors hover:border-[var(--accent)]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            + Add Step
          </button>

          <div>
            <label className="block text-sm font-semibold mb-2">
              What changed?{' '}
              <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder='e.g. "Simplified step 3"'
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
