'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RecipeData,
  Ingredient,
  Instruction,
  emptyRecipeData,
} from '@/lib/types';

interface Props {
  recipeId?: string;
  initialData?: RecipeData;
  initialTags?: string[];
  versionNumber?: number;
}

export default function RecipeForm({
  recipeId,
  initialData,
  initialTags = [],
  versionNumber = 1,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<RecipeData>(
    initialData ?? emptyRecipeData(),
  );
  const [tagInput, setTagInput] = useState(initialTags.join(', '));
  const [tags, setTags] = useState<string[]>(initialTags);
  const [changeNote, setChangeNote] = useState('');

  const UNITS = [
    'tsp',
    'tbsp',
    'cup',
    'fl oz',
    'ml',
    'L',
    'oz',
    'lb',
    'g',
    'kg',
  ];
  const [customUnitRows, setCustomUnitRows] = useState<Set<number>>(
    () =>
      new Set(
        (initialData?.ingredients ?? [])
          .map((ing, i) =>
            !UNITS.includes(ing.unit) && ing.unit !== '' ? i : -1,
          )
          .filter((i) => i >= 0),
      ),
  );
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(recipeId);

  function updateField<K extends keyof RecipeData>(
    key: K,
    value: RecipeData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addIngredient() {
    updateField('ingredients', [
      ...data.ingredients,
      { amount: '', unit: '', name: '', notes: '' },
    ]);
  }

  function updateIngredient(
    i: number,
    field: keyof Ingredient,
    value: string,
  ) {
    updateField(
      'ingredients',
      data.ingredients.map((ing, idx) =>
        idx === i ? { ...ing, [field]: value } : ing,
      ),
    );
  }

  function removeIngredient(i: number) {
    updateField(
      'ingredients',
      data.ingredients.filter((_, idx) => idx !== i),
    );
  }

  function addInstruction() {
    const nextStep =
      (data.instructions[data.instructions.length - 1]?.step ?? 0) +
      1;
    updateField('instructions', [
      ...data.instructions,
      { step: nextStep, text: '' },
    ]);
  }

  function updateInstruction(i: number, value: string) {
    updateField(
      'instructions',
      data.instructions.map((inst, idx) =>
        idx === i ? { ...inst, text: value } : inst,
      ),
    );
  }

  function removeInstruction(i: number) {
    updateField(
      'instructions',
      data.instructions
        .filter((_, idx) => idx !== i)
        .map((inst, idx) => ({ ...inst, step: idx + 1 })),
    );
  }

  function commitTags(raw: string) {
    const parsed = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setTags(parsed);
    // Reformat display string
    setTagInput(parsed.join(', '));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.title.trim()) return;
    setSaving(true);

    // Commit any uncommitted tag input
    const finalTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // If editing and recipe data is unchanged, only update tags (no new version)
    const recipeDataChanged =
      JSON.stringify(data) !== JSON.stringify(initialData);

    if (isEdit && !recipeDataChanged) {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: finalTags }),
      });
      if (res.ok) {
        router.push(`/recipes/${recipeId}`);
        router.refresh();
      } else {
        setSaving(false);
      }
      return;
    }

    const url = isEdit ? `/api/recipes/${recipeId}` : '/api/recipes';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        tags: finalTags,
        changeNote: changeNote || undefined,
      }),
    });

    if (res.ok) {
      const recipe = await res.json();
      router.push(`/recipes/${recipe.id}`);
      router.refresh();
    } else {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full px-4 py-3 text-base rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]';
  const inputStyle = { borderColor: 'var(--border)' };
  const labelClass = 'block text-sm font-semibold mb-2';
  const sectionClass = 'flex flex-col gap-2';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Title */}
      <div className={sectionClass}>
        <label className={labelClass}>Recipe Name *</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g. Grandma's Lasagna"
          className={inputClass}
          style={inputStyle}
          required
        />
      </div>

      {/* Description */}
      <div className={sectionClass}>
        <label className={labelClass}>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="A short description of this recipe…"
          rows={3}
          className={inputClass}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Times & Servings */}
      <div className={sectionClass}>
        <label className={labelClass}>Time &amp; Servings</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p
              className="text-xs mb-1.5"
              style={{ color: 'var(--muted)' }}
            >
              Prep (min)
            </p>
            <input
              type="number"
              min={0}
              value={data.prepTime ?? ''}
              onChange={(e) =>
                updateField(
                  'prepTime',
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="30"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <p
              className="text-xs mb-1.5"
              style={{ color: 'var(--muted)' }}
            >
              Cook (min)
            </p>
            <input
              type="number"
              min={0}
              value={data.cookTime ?? ''}
              onChange={(e) =>
                updateField(
                  'cookTime',
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="45"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <p
              className="text-xs mb-1.5"
              style={{ color: 'var(--muted)' }}
            >
              Servings
            </p>
            <input
              type="number"
              min={1}
              value={data.servings ?? ''}
              onChange={(e) =>
                updateField(
                  'servings',
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              placeholder="4"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className={sectionClass}>
        <label className={labelClass}>Ingredients</label>
        <div className="flex flex-col gap-2">
          {data.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="grid grid-cols-[80px_130px_1fr] gap-2 flex-1">
                <input
                  value={ing.amount}
                  onChange={(e) =>
                    updateIngredient(i, 'amount', e.target.value)
                  }
                  placeholder="1½"
                  className={inputClass}
                  style={inputStyle}
                />
                {customUnitRows.has(i) ? (
                  <div className="flex gap-1">
                    <input
                      value={ing.unit}
                      onChange={(e) =>
                        updateIngredient(i, 'unit', e.target.value)
                      }
                      placeholder="unit"
                      className={inputClass}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomUnitRows((prev) => {
                          const next = new Set(prev);
                          next.delete(i);
                          return next;
                        });
                        updateIngredient(i, 'unit', '');
                      }}
                      className="flex-shrink-0 flex items-center justify-center w-8 self-stretch rounded-xl text-xs font-medium"
                      style={{
                        color: 'var(--accent)',
                        border: '1px solid var(--border)',
                      }}
                      title="Back to list"
                    >
                      ↩
                    </button>
                  </div>
                ) : (
                  <select
                    value={ing.unit}
                    onChange={(e) => {
                      if (e.target.value === '__other__') {
                        setCustomUnitRows(
                          (prev) => new Set([...prev, i]),
                        );
                        updateIngredient(i, 'unit', '');
                      } else {
                        updateIngredient(i, 'unit', e.target.value);
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
                <input
                  value={ing.name}
                  onChange={(e) =>
                    updateIngredient(i, 'name', e.target.value)
                  }
                  placeholder="flour"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl text-2xl leading-none"
                style={{ color: 'var(--muted)' }}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-colors hover:border-[var(--accent)] mt-1"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--muted)',
            }}
          >
            + Add Ingredient
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className={sectionClass}>
        <label className={labelClass}>Instructions</label>
        <div className="flex flex-col gap-2">
          {data.instructions.map((inst, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span
                className="flex-shrink-0 w-9 h-9 mt-1.5 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'var(--accent)' }}
              >
                {inst.step}
              </span>
              <textarea
                value={inst.text}
                onChange={(e) => updateInstruction(i, e.target.value)}
                placeholder={`Step ${inst.step}…`}
                rows={3}
                className={`${inputClass} flex-1`}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <button
                type="button"
                onClick={() => removeInstruction(i)}
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl text-2xl leading-none"
                style={{ color: 'var(--muted)' }}
                aria-label="Remove step"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-colors hover:border-[var(--accent)] mt-1"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--muted)',
            }}
          >
            + Add Step
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className={sectionClass}>
        <label className={labelClass}>Tags</label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onBlur={(e) => commitTags(e.target.value)}
          placeholder="italian, pasta, weeknight"
          className={inputClass}
          style={inputStyle}
        />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Separate tags with commas — saved separately, won&apos;t
          create a new version
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: 'var(--border)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className={sectionClass}>
        <label className={labelClass}>Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Tips, substitutions, things to try next time…"
          rows={4}
          className={inputClass}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Change note (edit only) */}
      {isEdit && (
        <div
          className="p-5 rounded-2xl flex flex-col gap-3"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <label className={labelClass}>
              What did you change?{' '}
              <span
                className="font-normal"
                style={{ color: 'var(--muted)' }}
              >
                (optional)
              </span>
            </label>
            <p
              className="text-sm mb-2"
              style={{ color: 'var(--muted)' }}
            >
              Helps you remember why you made this change. Saved as
              Version {versionNumber}.
            </p>
          </div>
          <input
            type="text"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder={`e.g. "Reduced sugar by ¼ cup, added lemon zest"`}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 flex items-center justify-center py-4 font-semibold rounded-xl border"
          style={{ borderColor: 'var(--border)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !data.title.trim()}
          className="flex-1 flex items-center justify-center py-4 text-white font-semibold rounded-xl disabled:opacity-60 transition-opacity"
          style={{ background: 'var(--accent)' }}
        >
          {saving
            ? 'Saving…'
            : isEdit
              ? 'Save Changes'
              : 'Add Recipe'}
        </button>
      </div>
    </form>
  );
}
