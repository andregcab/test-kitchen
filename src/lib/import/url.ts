import * as cheerio from "cheerio";
import { RecipeData, Ingredient, Instruction } from "@/lib/types";

// Parse ISO 8601 duration to minutes (e.g. "PT1H30M" → 90)
function parseDuration(iso: string | undefined): number | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const total = hours * 60 + minutes;
  return total > 0 ? total : null;
}

// Best-effort parse of "1 cup flour" → { amount, unit, name, notes }
const UNITS = [
  "cups?", "tbsp?", "tablespoons?", "tsp?", "teaspoons?",
  "oz", "ounces?", "lbs?", "pounds?", "g", "grams?", "kg",
  "ml", "liters?", "l", "quarts?", "pints?", "gallons?",
  "cloves?", "cans?", "packages?", "pkgs?", "slices?",
  "pieces?", "stalks?", "sprigs?", "bunches?", "heads?",
  "pinch(?:es)?", "dash(?:es)?", "handfuls?",
];
const unitPattern = new RegExp(`^(${UNITS.join("|")})\\b`, "i");
const fractionMap: Record<string, string> = {
  "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4",
  "¾": "3/4", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8",
};

function normalizeText(s: string): string {
  return Object.entries(fractionMap).reduce(
    (acc, [frac, rep]) => acc.replace(frac, rep),
    s
  ).trim();
}

function parseIngredientString(raw: string): Ingredient {
  const s = normalizeText(raw);
  // Match leading number/fraction
  const numMatch = s.match(
    /^((?:\d+\s+)?(?:\d+\/\d+|\d*\.?\d+))\s*/
  );
  const amount = numMatch ? numMatch[1].trim() : "";
  const rest = numMatch ? s.slice(numMatch[0].length) : s;

  // Match unit
  const unitMatch = rest.match(unitPattern);
  const unit = unitMatch ? unitMatch[0].trim() : "";
  const afterUnit = unitMatch ? rest.slice(unitMatch[0].length).trim() : rest;

  // Split on comma for notes
  const commaParts = afterUnit.split(",");
  const name = commaParts[0].replace(/^of\s+/i, "").trim();
  const notes = commaParts.slice(1).join(",").trim();

  return { amount, unit, name, notes };
}

function parseInstructions(raw: unknown): Instruction[] {
  if (!Array.isArray(raw)) return [];
  const steps: string[] = [];

  for (const item of raw) {
    if (typeof item === "string") {
      steps.push(item);
    } else if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      if (obj["@type"] === "HowToSection" && Array.isArray(obj.itemListElement)) {
        for (const sub of obj.itemListElement) {
          const text = (sub as Record<string, unknown>).text;
          if (typeof text === "string") steps.push(text);
        }
      } else if (typeof obj.text === "string") {
        steps.push(obj.text);
      }
    }
  }

  return steps
    .map((text, i) => ({ step: i + 1, text: text.trim() }))
    .filter((s) => s.text.length > 0);
}

function parseServings(raw: unknown): number | null {
  if (!raw) return null;
  const s = Array.isArray(raw) ? String(raw[0]) : String(raw);
  const match = s.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function parseTags(recipe: Record<string, unknown>): string[] {
  const tags: string[] = [];
  const sources = [recipe.keywords, recipe.recipeCategory, recipe.recipeCuisine];
  for (const src of sources) {
    if (!src) continue;
    const items = Array.isArray(src) ? src : String(src).split(",");
    for (const item of items) {
      const tag = String(item).trim().toLowerCase();
      if (tag && !tags.includes(tag)) tags.push(tag);
    }
  }
  return tags;
}

// Find schema.org Recipe JSON-LD in page HTML
function extractJsonLd(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    const text = $(scripts[i]).html() ?? "";
    try {
      const parsed = JSON.parse(text);
      // Can be a single object or an array
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const obj of candidates) {
        if (!obj || typeof obj !== "object") continue;
        // Sometimes nested in @graph
        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          const recipe = obj["@graph"].find(
            (n: Record<string, unknown>) =>
              String(n["@type"]).includes("Recipe")
          );
          if (recipe) return recipe;
        }
        if (String(obj["@type"]).includes("Recipe")) return obj;
      }
    } catch {
      // invalid JSON, skip
    }
  }
  return null;
}

export type ImportResult =
  | { ok: true; data: RecipeData; tags: string[] }
  | { ok: false; reason: "no_structured_data" | "fetch_error" | "invalid_url" };

export async function importFromUrl(url: string): Promise<ImportResult> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; test-kitchen-recipe-importer/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, reason: "fetch_error" };
    html = await res.text();
  } catch {
    return { ok: false, reason: "fetch_error" };
  }

  const jsonLd = extractJsonLd(html);
  if (!jsonLd) return { ok: false, reason: "no_structured_data" };

  const ingredients = Array.isArray(jsonLd.recipeIngredient)
    ? (jsonLd.recipeIngredient as string[]).map(parseIngredientString)
    : [];

  const data: RecipeData = {
    title: String(jsonLd.name ?? "Untitled Recipe"),
    description: String(jsonLd.description ?? ""),
    sourceUrl: url,
    sourceType: "url",
    servings: parseServings(jsonLd.recipeYield),
    prepTime: parseDuration(jsonLd.prepTime as string),
    cookTime: parseDuration(jsonLd.cookTime as string),
    ingredients,
    instructions: parseInstructions(jsonLd.recipeInstructions),
    notes: "",
  };

  return { ok: true, data, tags: parseTags(jsonLd) };
}
