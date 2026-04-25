import Anthropic from '@anthropic-ai/sdk';
import { RecipeData, Ingredient, Instruction } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a recipe parser. The user will show you a photo of a recipe — from a cookbook page, handwritten card, printed sheet, or magazine. Extract the recipe and return it as a single JSON object with exactly this structure:

{
  "title": "string",
  "description": "string (brief description, or empty string)",
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
  "notes": "string (any tips, variations, or notes from the recipe, or empty string)"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation, no code fences.
- For ingredients: amount is the numeric quantity (e.g. "1", "1/2", "2-3"), unit is the measurement (e.g. "cup", "tbsp", "oz", or "" if none), name is the ingredient name, notes is anything after a comma or in parentheses (e.g. "finely chopped", "room temperature").
- Steps must be numbered starting from 1.
- If you cannot read part of the image clearly, do your best and leave that field as an empty string or null.
- Tags should be 1-4 short culinary descriptors (e.g. "italian", "pasta", "vegetarian", "quick"). Do not include the word "recipe".
- Times should be in minutes as plain numbers.`;

export type PhotoParseResult =
  | { ok: true; data: RecipeData; tags: string[] }
  | { ok: false; reason: 'parse_error' | 'no_recipe_found' | 'api_error' };

export async function parseRecipeFromImage(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
): Promise<PhotoParseResult> {
  let raw: string;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: 'Please extract the recipe from this image and return it as JSON.',
            },
          ],
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== 'text') return { ok: false, reason: 'parse_error' };
    raw = block.text.trim();
  } catch {
    return { ok: false, reason: 'api_error' };
  }

  // Strip any accidental markdown code fences
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
        unit: String(ing.unit ?? ''),
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
    source: null,
    sourceType: 'photo',
    servings: typeof parsed.servings === 'number' ? parsed.servings : null,
    prepTime: typeof parsed.prepTime === 'number' ? parsed.prepTime : null,
    cookTime: typeof parsed.cookTime === 'number' ? parsed.cookTime : null,
    ingredients,
    instructions,
    notes: String(parsed.notes ?? ''),
  };

  return { ok: true, data, tags };
}
