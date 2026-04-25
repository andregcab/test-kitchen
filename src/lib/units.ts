const UNIT_NORMALIZE: Record<string, string> = {
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp', 'table spoon': 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp',
  cups: 'cup',
  'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz',
  ounce: 'oz', ounces: 'oz',
  pound: 'lb', pounds: 'lb',
  gram: 'g', grams: 'g',
  kilogram: 'kg', kilograms: 'kg',
  milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml',
  liter: 'L', liters: 'L', litre: 'L', litres: 'L',
};

const VALID_UNITS = new Set(['tsp', 'tbsp', 'cup', 'fl oz', 'ml', 'L', 'oz', 'lb', 'g', 'kg']);

export function normalizeUnit(raw: string): string {
  const trimmed = raw.trim();
  if (VALID_UNITS.has(trimmed)) return trimmed;
  return UNIT_NORMALIZE[trimmed.toLowerCase()] ?? trimmed;
}
