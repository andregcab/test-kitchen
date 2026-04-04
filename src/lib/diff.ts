import { RecipeData, Ingredient, Instruction } from "./types";

export type ChangeKind = "added" | "removed" | "changed";

export interface Change {
  field: string;
  kind: ChangeKind;
  from?: string;
  to?: string;
}

function fmt(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === "") return "—";
  return String(val);
}

function fmtMinutes(val: number | null | undefined): string {
  if (!val) return "—";
  return `${val} min`;
}

function fmtIngredient(ing: Ingredient): string {
  return [ing.amount, ing.unit, ing.name, ing.notes ? `(${ing.notes})` : ""]
    .filter(Boolean)
    .join(" ");
}

function fmtInstruction(inst: Instruction): string {
  return `Step ${inst.step}: ${inst.text}`;
}

export function diffRecipes(from: RecipeData, to: RecipeData): Change[] {
  const changes: Change[] = [];

  // Scalar fields
  const scalars: { key: keyof RecipeData; label: string; format?: (v: unknown) => string }[] = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "servings", label: "Servings" },
    { key: "prepTime", label: "Prep time", format: (v) => fmtMinutes(v as number) },
    { key: "cookTime", label: "Cook time", format: (v) => fmtMinutes(v as number) },
    { key: 'source', label: 'Source' },
    { key: "notes", label: "Notes" },
  ];

  for (const { key, label, format } of scalars) {
    const fromVal = from[key];
    const toVal = to[key];
    if (fmt(fromVal as string) !== fmt(toVal as string)) {
      changes.push({
        field: label,
        kind: "changed",
        from: format ? format(fromVal) : fmt(fromVal as string),
        to: format ? format(toVal) : fmt(toVal as string),
      });
    }
  }

  // Ingredients — match by name, detect adds/removes/changes
  const fromIngMap = new Map(from.ingredients.map((i) => [i.name.toLowerCase(), i]));
  const toIngMap = new Map(to.ingredients.map((i) => [i.name.toLowerCase(), i]));

  for (const [name, toIng] of toIngMap) {
    const fromIng = fromIngMap.get(name);
    if (!fromIng) {
      changes.push({ field: "Ingredient", kind: "added", to: fmtIngredient(toIng) });
    } else {
      const fromStr = fmtIngredient(fromIng);
      const toStr = fmtIngredient(toIng);
      if (fromStr !== toStr) {
        changes.push({ field: "Ingredient", kind: "changed", from: fromStr, to: toStr });
      }
    }
  }
  for (const [name, fromIng] of fromIngMap) {
    if (!toIngMap.has(name)) {
      changes.push({ field: "Ingredient", kind: "removed", from: fmtIngredient(fromIng) });
    }
  }

  // Instructions — match by step number
  const fromInstMap = new Map(from.instructions.map((i) => [i.step, i]));
  const toInstMap = new Map(to.instructions.map((i) => [i.step, i]));

  for (const [step, toInst] of toInstMap) {
    const fromInst = fromInstMap.get(step);
    if (!fromInst) {
      changes.push({ field: "Instruction", kind: "added", to: fmtInstruction(toInst) });
    } else if (fromInst.text !== toInst.text) {
      changes.push({
        field: "Instruction",
        kind: "changed",
        from: fmtInstruction(fromInst),
        to: fmtInstruction(toInst),
      });
    }
  }
  for (const [step, fromInst] of fromInstMap) {
    if (!toInstMap.has(step)) {
      changes.push({ field: "Instruction", kind: "removed", from: fmtInstruction(fromInst) });
    }
  }

  return changes;
}
