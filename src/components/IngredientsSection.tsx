'use client';

import { Ingredient } from '@/lib/types';
import { useMetric } from '@/lib/useMetric';

function abbrevUnit(unit: string): string {
  const map: Record<string, string> = {
    tablespoon: 'tbsp', tablespoons: 'tbsp',
    teaspoon: 'tsp', teaspoons: 'tsp',
    cup: 'cup', cups: 'cup',
    ounce: 'oz', ounces: 'oz',
    pound: 'lb', pounds: 'lb',
    gram: 'g', grams: 'g',
    kilogram: 'kg', kilograms: 'kg',
    milliliter: 'ml', milliliters: 'ml',
    liter: 'L', liters: 'L',
    'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz',
  };
  return map[unit.toLowerCase()] ?? unit;
}

interface Props {
  ingredients: Ingredient[];
}

export default function IngredientsSection({ ingredients }: Props) {
  const { metric, toggle } = useMetric();

  const hasAnyMetric = ingredients.some((ing) => ing.metricAmount);

  function displayAmount(ing: Ingredient): string {
    if (metric && ing.metricAmount) {
      return [ing.metricAmount, ing.metricUnit ?? ''].filter(Boolean).join(' ');
    }
    return [ing.amount, ing.unit ? abbrevUnit(ing.unit) : ''].filter(Boolean).join(' ');
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Ingredients</h2>
        {hasAnyMetric && (
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: metric ? 'var(--accent)' : 'var(--card)',
              color: metric ? 'white' : 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            {metric ? 'Metric' : 'Imperial'}
          </button>
        )}
      </div>
      <ul className="flex flex-col">
        {ingredients.map((ing, i) => (
          <li
            key={i}
            className="flex gap-6 py-3"
            style={{
              borderBottom: i < ingredients.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span
              className="w-32 flex-shrink-0 text-left font-semibold tabular-nums"
              style={{ color: 'var(--accent)' }}
            >
              {displayAmount(ing)}
            </span>
            <span className="pl-3">
              {ing.name}
              {ing.notes && ` ${ing.notes}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
