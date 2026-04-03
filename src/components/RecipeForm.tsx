"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecipeData, Ingredient, Instruction, emptyRecipeData } from "@/lib/types";

interface Props {
  recipeId?: string;
  initialData?: RecipeData;
  versionNumber?: number;
}

export default function RecipeForm({ recipeId, initialData, versionNumber = 1 }: Props) {
  const router = useRouter();
  const [data, setData] = useState<RecipeData>(initialData ?? emptyRecipeData());
  const [changeNote, setChangeNote] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(recipeId);

  function updateField<K extends keyof RecipeData>(key: K, value: RecipeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addIngredient() {
    updateField("ingredients", [
      ...data.ingredients,
      { amount: "", unit: "", name: "", notes: "" },
    ]);
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    const updated = data.ingredients.map((ing, idx) =>
      idx === i ? { ...ing, [field]: value } : ing
    );
    updateField("ingredients", updated);
  }

  function removeIngredient(i: number) {
    updateField("ingredients", data.ingredients.filter((_, idx) => idx !== i));
  }

  function addInstruction() {
    const nextStep = (data.instructions[data.instructions.length - 1]?.step ?? 0) + 1;
    updateField("instructions", [
      ...data.instructions,
      { step: nextStep, text: "" },
    ]);
  }

  function updateInstruction(i: number, value: string) {
    const updated = data.instructions.map((inst, idx) =>
      idx === i ? { ...inst, text: value } : inst
    );
    updateField("instructions", updated);
  }

  function removeInstruction(i: number) {
    const updated = data.instructions
      .filter((_, idx) => idx !== i)
      .map((inst, idx) => ({ ...inst, step: idx + 1 }));
    updateField("instructions", updated);
  }

  function updateTags(raw: string) {
    const tags = raw.split(",").map((t) => t.trim()).filter(Boolean);
    updateField("tags", tags);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.title.trim()) return;
    setSaving(true);

    const url = isEdit ? `/api/recipes/${recipeId}` : "/api/recipes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, changeNote: changeNote || undefined }),
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
    "w-full px-4 py-3 text-base rounded-xl border-2 outline-none focus:border-[var(--accent)] transition-colors bg-[var(--background)]";
  const inputStyle = { borderColor: "var(--border)" };
  const labelClass = "block text-sm font-semibold mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <label className={labelClass}>Recipe Name *</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g. Grandma's Lasagna"
          className={inputClass}
          style={inputStyle}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="A short description of this recipe…"
          rows={3}
          className={inputClass}
          style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
        />
      </div>

      {/* Times & Servings */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Prep (min)</label>
          <input
            type="number"
            min={0}
            value={data.prepTime ?? ""}
            onChange={(e) =>
              updateField("prepTime", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="30"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass}>Cook (min)</label>
          <input
            type="number"
            min={0}
            value={data.cookTime ?? ""}
            onChange={(e) =>
              updateField("cookTime", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="45"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass}>Servings</label>
          <input
            type="number"
            min={1}
            value={data.servings ?? ""}
            onChange={(e) =>
              updateField("servings", e.target.value ? Number(e.target.value) : null)
            }
            placeholder="4"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className={labelClass}>Ingredients</label>
        <div className="flex flex-col gap-2">
          {data.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="grid grid-cols-[80px_80px_1fr] gap-2 flex-1">
                <input
                  value={ing.amount}
                  onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                  placeholder="1½"
                  className={inputClass}
                  style={inputStyle}
                />
                <input
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  placeholder="cups"
                  className={inputClass}
                  style={inputStyle}
                />
                <input
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  placeholder="flour"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl text-xl"
                style={{ color: "var(--muted)" }}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-colors hover:border-[var(--accent)]"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            + Add Ingredient
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className={labelClass}>Instructions</label>
        <div className="flex flex-col gap-2">
          {data.instructions.map((inst, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span
                className="flex-shrink-0 w-9 h-9 mt-1.5 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "var(--accent)" }}
              >
                {inst.step}
              </span>
              <textarea
                value={inst.text}
                onChange={(e) => updateInstruction(i, e.target.value)}
                placeholder={`Step ${inst.step}…`}
                rows={2}
                className={`${inputClass} flex-1`}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <button
                type="button"
                onClick={() => removeInstruction(i)}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl text-xl"
                style={{ color: "var(--muted)" }}
                aria-label="Remove step"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-colors hover:border-[var(--accent)]"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            + Add Step
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags</label>
        <input
          type="text"
          value={data.tags.join(", ")}
          onChange={(e) => updateTags(e.target.value)}
          placeholder="italian, pasta, weeknight"
          className={inputClass}
          style={inputStyle}
        />
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Separate tags with commas
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Tips, substitutions, things to try next time…"
          rows={4}
          className={inputClass}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Change note (edit only) */}
      {isEdit && (
        <div
          className="p-4 rounded-2xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <label className={labelClass}>
            What did you change?{" "}
            <span className="font-normal" style={{ color: "var(--muted)" }}>
              (optional — helps you remember later)
            </span>
          </label>
          <input
            type="text"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder={`e.g. "Reduced sugar by ¼ cup, added lemon zest"`}
            className={inputClass}
            style={inputStyle}
          />
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            This will be saved as Version {versionNumber}
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-4 font-semibold rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !data.title.trim()}
          className="flex-1 py-4 text-white font-semibold rounded-xl disabled:opacity-60 transition-opacity"
          style={{ background: "var(--accent)" }}
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Recipe"}
        </button>
      </div>
    </form>
  );
}
