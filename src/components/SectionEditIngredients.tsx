'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeData, Ingredient } from '@/lib/types';
import BottomSheet from './BottomSheet';

const Pencil = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const UNITS = ['tsp', 'tbsp', 'cup', 'fl oz', 'ml', 'L', 'oz', 'lb', 'g', 'kg'];

interface Props {
  recipeId: string;
  branchId?: string;
  data: RecipeData;
  tags: string[];
  images: string[];
}

export default function SectionEditIngredients({ recipeId, branchId, data, tags, images }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [customRows, setCustomRows] = useState<Set<number>>(new Set());
  const [changeNote, setChangeNote] = useState('');
  const [saving, setSaving] = useState(false);

  function handleOpen() {
    // The AI parser splits "garlic finely grated" into name:"garlic" + notes:"finely grated".
    // Merge them into one editable field so the user sees and edits the full description.
    const rows = data.ingredients.map((ingredient) => ({
      ...ingredient,
      name: [ingredient.name, ingredient.notes].filter(Boolean).join(' '),
      notes: '',
    }));
    setIngredients(rows);
    setCustomRows(
      new Set(
        rows.map((row, idx) => (!UNITS.includes(row.unit) && row.unit !== '' ? idx : -1)).filter((idx) => idx >= 0),
      ),
    );
    setChangeNote('');
    setOpen(true);
  }

  function update(i: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) => prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)));
  }

  function add() {
    setIngredients((prev) => [...prev, { amount: '', unit: '', name: '', notes: '' }]);
  }

  function remove(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
    setCustomRows((prev) => {
      const next = new Set<number>();
      prev.forEach((r) => { if (r < i) next.add(r); else if (r > i) next.add(r - 1); });
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { ...data, ingredients },
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

  const inputClass = 'w-full px-3 py-3 text-base rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]';
  const inputStyle = { borderColor: 'var(--border)' };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--border)]"
        style={{ color: 'var(--muted)' }}
        aria-label="Edit ingredients"
      >
        <Pencil />
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Edit Ingredients">
        <div className="flex flex-col gap-4 pb-4">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="grid grid-cols-[72px_120px_1fr] gap-2 flex-1">
                <input value={ing.amount} onChange={(e) => update(i, 'amount', e.target.value)} placeholder="1½" className={inputClass} style={inputStyle} />
                {customRows.has(i) ? (
                  <div className="flex gap-1">
                    <input value={ing.unit} onChange={(e) => update(i, 'unit', e.target.value)} placeholder="unit" className={inputClass} style={inputStyle} />
                    <button
                      type="button"
                      onClick={() => { setCustomRows((p) => { const n = new Set(p); n.delete(i); return n; }); update(i, 'unit', ''); }}
                      className="flex-shrink-0 flex items-center justify-center w-8 self-stretch rounded-xl text-xs"
                      style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}
                    >↩</button>
                  </div>
                ) : (
                  <select
                    value={ing.unit}
                    onChange={(e) => {
                      if (e.target.value === '__other__') {
                        setCustomRows((p) => new Set([...p, i]));
                        update(i, 'unit', '');
                      } else {
                        update(i, 'unit', e.target.value);
                      }
                    }}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="">—</option>
                    <optgroup label="Volume">
                      <option value="tsp">tsp</option>
                      <option value="tbsp">tbsp</option>
                      <option value="cup">cup</option>
                      <option value="fl oz">fl oz</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                    </optgroup>
                    <optgroup label="Weight">
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                    </optgroup>
                    <option value="__other__">Other…</option>
                  </select>
                )}
                <input value={ing.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="flour" className={inputClass} style={inputStyle} />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl text-2xl leading-none"
                style={{ color: 'var(--muted)' }}
                aria-label="Remove"
              >×</button>
            </div>
          ))}

          <button
            type="button"
            onClick={add}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-colors hover:border-[var(--accent)]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            + Add Ingredient
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
              placeholder='e.g. "Reduced butter to 2 tbsp"'
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
