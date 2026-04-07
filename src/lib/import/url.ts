import * as cheerio from 'cheerio';
import { RecipeData, Ingredient, Instruction } from '@/lib/types';

// Parse ISO 8601 duration to minutes (e.g. "PT1H30M" → 90)
function parseDuration(iso: string | undefined): number | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const total = hours * 60 + minutes;
  return total > 0 ? total : null;
}

// Best-effort parse of "1 cup flour" → { amount, unit, name, notes }
const UNITS = [
  'cups?',
  'tbsp?',
  'tablespoons?',
  'tsp?',
  'teaspoons?',
  'oz',
  'ounces?',
  'lbs?',
  'pounds?',
  'g',
  'grams?',
  'kg',
  'ml',
  'liters?',
  'l',
  'quarts?',
  'pints?',
  'gallons?',
  'cloves?',
  'cans?',
  'packages?',
  'pkgs?',
  'slices?',
  'pieces?',
  'stalks?',
  'sprigs?',
  'bunches?',
  'heads?',
  'pinch(?:es)?',
  'dash(?:es)?',
  'handfuls?',
];
const unitPattern = new RegExp(`^(${UNITS.join('|')})\\b`, 'i');
const fractionMap: Record<string, string> = {
  '½': '1/2',
  '⅓': '1/3',
  '⅔': '2/3',
  '¼': '1/4',
  '¾': '3/4',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
};

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function cleanString(s: string): string {
  return decodeHtmlEntities(
    Object.entries(fractionMap)
      .reduce((acc, [frac, rep]) => acc.replace(frac, rep), s)
  ).replace(/\s+/g, ' ').trim();
}

function normalizeText(s: string): string {
  return cleanString(s);
}

const UNIT_NORMALIZE: Record<string, string> = {
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp',
  cup: 'cup', cups: 'cup',
  'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz',
  ounce: 'oz', ounces: 'oz',
  pound: 'lb', pounds: 'lb',
  gram: 'g', grams: 'g',
  kilogram: 'kg', kilograms: 'kg',
  milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml',
  liter: 'L', liters: 'L', litre: 'L', litres: 'L',
};

function normalizeUnit(unit: string): string {
  return UNIT_NORMALIZE[unit.toLowerCase()] ?? unit;
}

// Imperial → metric conversion factors (volume stays volume, weight stays weight)
const METRIC_CONVERSIONS: Record<string, { factor: number; unit: string }> = {
  tsp:   { factor: 4.93,  unit: 'ml' },
  tbsp:  { factor: 14.79, unit: 'ml' },
  cup:   { factor: 240,   unit: 'ml' },
  'fl oz': { factor: 29.57, unit: 'ml' },
  oz:    { factor: 28.35, unit: 'g' },
  lb:    { factor: 453.59, unit: 'g' },
};

function toMetric(amount: string, unit: string): { metricAmount: string; metricUnit: string } | null {
  const conv = METRIC_CONVERSIONS[unit.toLowerCase()];
  if (!conv) return null;
  // Handle ranges like "2-3"
  if (amount.includes('-')) {
    const [lo, hi] = amount.split('-').map((n) => parseFloat(n));
    if (isNaN(lo) || isNaN(hi)) return null;
    const loM = Math.round(lo * conv.factor);
    const hiM = Math.round(hi * conv.factor);
    return { metricAmount: `${loM}-${hiM}`, metricUnit: conv.unit };
  }
  // Handle fractions like "1/2"
  let val: number;
  if (amount.includes('/')) {
    const [n, d] = amount.split('/').map(Number);
    val = n / d;
  } else {
    val = parseFloat(amount);
  }
  if (isNaN(val)) return null;
  const converted = Math.round(val * conv.factor);
  return { metricAmount: String(converted), metricUnit: conv.unit };
}

// Match parenthetical metric values: "(240ml)", "(225 g)", "(about 450g)"
const PARENTHETICAL_METRIC = /\(\s*(?:about\s+)?(\d+(?:\.\d+)?)\s*(ml|g|kg|L)\s*\)/i;

function parseIngredientString(raw: string): Ingredient {
  const s = normalizeText(raw);

  // Extract and strip parenthetical metric value before other parsing
  const parenMatch = s.match(PARENTHETICAL_METRIC);
  const strippedS = s.replace(PARENTHETICAL_METRIC, '').replace(/\s+/g, ' ').trim();

  // Match leading number/fraction/range (e.g. 2, 1/2, 1.5, 2-3, 1 1/2)
  const numMatch = strippedS.match(/^((?:\d+\s+)?(?:\d+\/\d+|\d+\.\d+|\d+-\d+|\d+))\s*/);
  const amount = numMatch ? numMatch[1].trim() : '';
  const rest = numMatch ? strippedS.slice(numMatch[0].length) : strippedS;

  // Match unit
  const unitMatch = rest.match(unitPattern);
  const unit = unitMatch ? normalizeUnit(unitMatch[0].trim()) : '';
  const afterUnit = unitMatch
    ? rest.slice(unitMatch[0].length).trim()
    : rest;

  // Split on comma for notes
  const commaParts = afterUnit.split(',');
  const name = commaParts[0].replace(/^of\s+/i, '').trim();
  const notes = commaParts.slice(1).join(',').trim();

  // Metric: prefer parsed parenthetical, fall back to programmatic conversion
  let metricAmount: string | undefined;
  let metricUnit: string | undefined;
  if (parenMatch) {
    metricAmount = parenMatch[1];
    metricUnit = parenMatch[2].toLowerCase();
  } else if (amount && unit) {
    const conv = toMetric(amount, unit);
    if (conv) { metricAmount = conv.metricAmount; metricUnit = conv.metricUnit; }
  }

  return { amount, unit, name, notes, metricAmount, metricUnit };
}

function parseInstructions(raw: unknown): Instruction[] {
  if (!Array.isArray(raw)) return [];
  const steps: string[] = [];

  for (const item of raw) {
    if (typeof item === 'string') {
      steps.push(item);
    } else if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      if (
        obj['@type'] === 'HowToSection' &&
        Array.isArray(obj.itemListElement)
      ) {
        for (const sub of obj.itemListElement) {
          const text = (sub as Record<string, unknown>).text;
          if (typeof text === 'string') steps.push(text);
        }
      } else if (typeof obj.text === 'string') {
        steps.push(obj.text);
      }
    }
  }

  return steps
    .map((text, i) => ({ step: i + 1, text: cleanString(text) }))
    .filter((s) => s.text.length > 0);
}

function parseServings(raw: unknown): number | null {
  if (!raw) return null;
  const s = Array.isArray(raw) ? String(raw[0]) : String(raw);
  const match = s.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// Tags that appear in structured data but have no culinary meaning.
// Add to this list whenever a new noise tag shows up during import.
const TAG_BLOCKLIST = new Set([
  'web',
  'paywall',
  'subscriber',
  'subscriber only',
  'subscriber only content',
  'paywall subscriber only content',
  'paywall subscriber only content, web',
  'sponsored',
  'advertisement',
  'promoted',
  'recipe',
  'recipes',
  'food',
  'cooking',
  'cook',
  'bake club',
]);

function parseTags(recipe: Record<string, unknown>): string[] {
  const tags: string[] = [];
  const sources = [
    recipe.keywords,
    recipe.recipeCategory,
    recipe.recipeCuisine,
  ];
  for (const src of sources) {
    if (!src) continue;
    const items = Array.isArray(src) ? src : String(src).split(',');
    for (const item of items) {
      const tag = String(item).trim().toLowerCase();
      if (tag && !tags.includes(tag) && !TAG_BLOCKLIST.has(tag))
        tags.push(tag);
    }
  }
  return tags;
}

// Find schema.org Recipe JSON-LD in page HTML
function extractJsonLd(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    const text = $(scripts[i]).html() ?? '';
    try {
      const parsed = JSON.parse(text);
      // Can be a single object or an array
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const obj of candidates) {
        if (!obj || typeof obj !== 'object') continue;
        // Sometimes nested in @graph
        if (obj['@graph'] && Array.isArray(obj['@graph'])) {
          const recipe = obj['@graph'].find(
            (n: Record<string, unknown>) =>
              String(n['@type']).includes('Recipe'),
          );
          if (recipe) return recipe;
        }
        if (String(obj['@type']).includes('Recipe')) return obj;
      }
    } catch {
      // invalid JSON, skip
    }
  }
  return null;
}

const MAX_IMAGES = 3;

async function downloadImage(url: string, baseUrl: string): Promise<string | null> {
  try {
    const absolute = url.startsWith('http') ? url : new URL(url, baseUrl).href;
    const res = await fetch(absolute, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) return null;
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const { randomUUID } = await import('crypto');
    const { writeFile } = await import('fs/promises');
    const path = await import('path');
    const filename = `${randomUUID()}.${ext}`;
    const dest = path.join(process.cwd(), 'public', 'uploads', filename);
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buffer);
    return `/uploads/${filename}`;
  } catch {
    return null;
  }
}

async function extractImages(html: string, jsonLd: Record<string, unknown>, pageUrl: string): Promise<string[]> {
  const candidates: string[] = [];

  // 1. JSON-LD image field
  const ldImage = jsonLd.image;
  if (typeof ldImage === 'string') {
    candidates.push(ldImage);
  } else if (Array.isArray(ldImage)) {
    for (const img of ldImage) {
      if (typeof img === 'string') candidates.push(img);
      else if (img && typeof img === 'object' && typeof (img as Record<string, unknown>).url === 'string')
        candidates.push((img as Record<string, unknown>).url as string);
    }
  } else if (ldImage && typeof ldImage === 'object' && typeof (ldImage as Record<string, unknown>).url === 'string') {
    candidates.push((ldImage as Record<string, unknown>).url as string);
  }

  // 2. og:image meta tags
  const $ = cheerio.load(html);
  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
    const content = $(el).attr('content');
    if (content) candidates.push(content);
  });

  // Deduplicate and cap
  const unique = [...new Set(candidates)].slice(0, MAX_IMAGES);
  const downloaded = await Promise.all(unique.map((u) => downloadImage(u, pageUrl)));
  return downloaded.filter((u): u is string => u !== null);
}

export type ImportResult =
  | { ok: true; data: RecipeData; tags: string[]; images: string[] }
  | {
      ok: false;
      reason: 'no_structured_data' | 'fetch_error' | 'invalid_url';
    };

export async function importFromUrl(
  url: string,
): Promise<ImportResult> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; test-kitchen-recipe-importer/1.0)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, reason: 'fetch_error' };
    html = await res.text();
  } catch {
    return { ok: false, reason: 'fetch_error' };
  }

  const jsonLd = extractJsonLd(html);
  if (!jsonLd) return { ok: false, reason: 'no_structured_data' };

  const ingredients = Array.isArray(jsonLd.recipeIngredient)
    ? (jsonLd.recipeIngredient as string[]).map(parseIngredientString)
    : [];

  const data: RecipeData = {
    title: cleanString(String(jsonLd.name ?? 'Untitled Recipe')),
    description: cleanString(String(jsonLd.description ?? '')),
    source: url,
    sourceType: 'url',
    servings: parseServings(jsonLd.recipeYield),
    prepTime: parseDuration(jsonLd.prepTime as string),
    cookTime: parseDuration(jsonLd.cookTime as string),
    ingredients,
    instructions: parseInstructions(jsonLd.recipeInstructions),
    notes: '',
  };

  const images = await extractImages(html, jsonLd, url);
  return { ok: true, data, tags: parseTags(jsonLd), images };
}
