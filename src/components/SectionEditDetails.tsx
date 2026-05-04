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

export default function SectionEditDetails({ recipeId, branchId, data, tags, images }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [saving, setSaving] = useState(false);

  function handleOpen() {
    setTitle(data.title);
    setDescription(data.description);
    setSource(data.source ?? '');
    setPrepTime(data.prepTime?.toString() ?? '');
    setCookTime(data.cookTime?.toString() ?? '');
    setServings(data.servings?.toString() ?? '');
    setTagInput(tags.join(', '));
    setChangeNote('');
    setOpen(true);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const updated: RecipeData = {
      ...data,
      title: title.trim(),
      description,
      source: source.trim() || null,
      prepTime: prepTime ? Number(prepTime) : null,
      cookTime: cookTime ? Number(cookTime) : null,
      servings: servings ? Number(servings) : null,
    };
    const finalTags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: updated,
        tags: finalTags,
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
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/20"
        style={{ color: 'var(--foreground)', opacity: 0.55 }}
        aria-label="Edit details"
      >
        <Pencil />
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Edit Details">
        <div className="flex flex-col gap-5 pb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Source</label>
            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className={inputClass} style={inputStyle} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Prep (min)</label>
              <input type="number" min={0} value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Cook (min)</label>
              <input type="number" min={0} value={cookTime} onChange={(e) => setCookTime(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Servings</label>
              <input type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tags</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="italian, pasta, weeknight"
              className={inputClass}
              style={inputStyle}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>Separate with commas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              What changed?{' '}
              <span className="font-normal" style={{ color: 'var(--muted)' }}>(optional)</span>
            </label>
            <input type="text" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder='e.g. "Updated timing"' className={inputClass} style={inputStyle} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-4 font-semibold rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving || !title.trim()} className="flex-1 py-4 text-white font-semibold rounded-xl disabled:opacity-60" style={{ background: 'var(--accent)' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
