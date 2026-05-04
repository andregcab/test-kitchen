import Anthropic from '@anthropic-ai/sdk';
import { RecipeData, Ingredient, Instruction } from '@/lib/types';
import { normalizeUnit } from '@/lib/units';

const client = new Anthropic({ apiKey: process.env.TK_ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a recipe parser. The user will provide raw text from a video description, blog post, or other source that may contain a recipe. Extract the recipe and return it as a single JSON object with exactly this structure:

{
  "title": "string",
  "description": "string (introductory or headnote text — copy VERBATIM if present, empty string if none)",
  "source": "string (the source name if identifiable, e.g. a YouTube channel name or author — otherwise empty string)",
  "servings": number or null,
  "prepTime": number or null (minutes),
  "cookTime": number or null (minutes),
  "ingredients": [
    { "amount": "string", "unit": "string", "name": "string", "notes": "string" }
  ],
  "instructions": [
    { "step": number, "text": "string" }
  ],
  "tags": ["string"],
  "notes": "string (any tips, variations, or notes — copy verbatim, empty string if none)"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation, no code fences.
- For ingredients: amount is the numeric quantity (e.g. "1", "1/2", "2-3"), unit must be one of: tsp, tbsp, cup, fl oz, ml, L, oz, lb, g, kg — or empty string if none. name is the ingredient name. notes is anything after a comma or in parentheses.
- Steps must be numbered starting from 1.
- If no recipe is present in the text, return { "title": "" } and nothing else.
- Tags should be 1-4 short culinary descriptors. Do not include the word "recipe".
- Times should be in minutes as plain numbers.`;

export type TextParseResult =
  | { ok: true; data: RecipeData; tags: string[] }
  | { ok: false; reason: 'parse_error' | 'no_recipe_found' | 'api_error' };

export async function parseRecipeFromText(
  text: string,
  sourceUrl?: string,
  sourceName?: string | null,
): Promise<TextParseResult> {
  let raw: string;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please extract the recipe from the following text:\n\n${text}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== 'text') return { ok: false, reason: 'parse_error' };
    raw = block.text.trim();
  } catch (err) {
    console.error('[parseRecipeFromText] Anthropic API error:', err);
    return { ok: false, reason: 'api_error' };
  }

  raw = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'parse_error' };
  }

  if (!parsed.title) return { ok: false, reason: 'no_recipe_found' };

  const ingredients: Ingredient[] = Array.isArray(parsed.ingredients)
    ? (parsed.ingredients as Record<string, unknown>[]).map((ing) => ({
        amount: String(ing.amount ?? ''),
        unit: normalizeUnit(String(ing.unit ?? '')),
        name: String(ing.name ?? ''),
        notes: String(ing.notes ?? ''),
      }))
    : [];

  const instructions: Instruction[] = Array.isArray(parsed.instructions)
    ? (parsed.instructions as Record<string, unknown>[]).map((inst, i) => ({
        step: typeof inst.step === 'number' ? inst.step : i + 1,
        text: String(inst.text ?? ''),
      }))
    : [];

  const tags: string[] = Array.isArray(parsed.tags)
    ? (parsed.tags as unknown[]).map(String).filter(Boolean)
    : [];

  const data: RecipeData = {
    title: String(parsed.title ?? 'Untitled Recipe'),
    description: String(parsed.description ?? ''),
    source: sourceUrl ?? null,
    sourceName: sourceName ?? null,
    sourceType: 'url',
    servings: typeof parsed.servings === 'number' ? parsed.servings : null,
    prepTime: typeof parsed.prepTime === 'number' ? parsed.prepTime : null,
    cookTime: typeof parsed.cookTime === 'number' ? parsed.cookTime : null,
    ingredients,
    instructions,
    notes: String(parsed.notes ?? ''),
  };

  return { ok: true, data, tags };
}
