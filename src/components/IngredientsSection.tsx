'use client';

import { useState } from 'react';
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

// Snap to nearest practical fraction step per unit
function roundForUnit(val: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === 'tsp')          return Math.round(val / 0.25) * 0.25;
  if (u === 'tbsp')         return Math.round(val / 0.5)  * 0.5;
  if (u === 'cup')          return Math.round(val / 0.25) * 0.25;
  if (u === 'fl oz')        return Math.round(val / 0.5)  * 0.5;
  if (u === 'oz')           return Math.round(val / 0.25) * 0.25;
  if (u === 'lb')           return Math.round(val / 0.25) * 0.25;
  if (u === 'g' || u === 'ml') return val < 10 ? Math.round(val) : Math.round(val / 5) * 5;
  if (u === 'kg' || u === 'l') return Math.round(val / 0.1) * 0.1;
  // Unitless (eggs, cloves, cans) — whole numbers only
  return Math.round(val);
}

const VULGAR: [number, string][] = [
  [1/8, '⅛'], [1/4, '¼'], [1/3, '⅓'], [1/2, '½'],
  [2/3, '⅔'], [3/4, '¾'],
];

function toFractionString(val: number): string {
  if (val <= 0) return '';
  const whole = Math.floor(val);
  const frac  = val - whole;
  if (frac < 0.01) return String(whole);
  const match = VULGAR.find(([f]) => Math.abs(f - frac) < 0.05);
  const fracStr = match ? match[1] : val.toFixed(1).replace(/\.0$/, '');
  return whole > 0 ? `${whole}${fracStr}` : fracStr;
}

function parseAmount(s: string): number | null {
  s = s.trim();
  // Mixed number "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  // Fraction "3/4"
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  // Vulgar fraction characters
  for (const [val, char] of VULGAR) {
    if (s === char) return val;
    const withWhole = s.match(new RegExp(`^(\\d+)${char}$`));
    if (withWhole) return parseInt(withWhole[1]) + val;
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function scaleAmount(amount: string, unit: string, factor: number): string {
  if (factor === 1 || !amount) return amount;
  // Range "2-3"
  if (amount.includes('-')) {
    const [lo, hi] = amount.split('-');
    return `${scaleAmount(lo.trim(), unit, factor)}-${scaleAmount(hi.trim(), unit, factor)}`;
  }
  const val = parseAmount(amount);
  if (val === null) return amount;
  const scaled = roundForUnit(val * factor, unit);
  return toFractionString(scaled) || amount;
}

const PLURAL_UNITS: Record<string, string> = {
  cup: 'cups',
};

function pluralizeUnit(unit: string, scaledAmount: string): string {
  const parts = scaledAmount.split('-');
  const val = parseAmount(parts[parts.length - 1]);
  if (val !== null && val > 1 && PLURAL_UNITS[unit]) return PLURAL_UNITS[unit];
  return unit;
}

type ScaleFactor = 0.5 | 1 | 2;
const SCALE_LABELS: { factor: ScaleFactor; label: string }[] = [
  { factor: 0.5, label: '½x' },
  { factor: 1,   label: '1x' },
  { factor: 2,   label: '2x' },
];

interface Props {
  ingredients: Ingredient[];
  servings: number | null;
}

export default function IngredientsSection({ ingredients, servings }: Props) {
  const { metric, toggle: toggleMetric } = useMetric();
  const [scale, setScale] = useState<ScaleFactor>(1);

  const hasAnyMetric = ingredients.some((ing) => ing.metricAmount);
  const scaledServings = servings ? Math.round(servings * scale) : null;

  function displayAmount(ing: Ingredient): string {
    const rawAmount = metric && ing.metricAmount ? ing.metricAmount : ing.amount;
    const rawUnit   = metric && ing.metricUnit   ? ing.metricUnit   : abbrevUnit(ing.unit ?? '');
    const scaledAmt = scaleAmount(rawAmount, rawUnit, scale);
    const displayUnit = pluralizeUnit(rawUnit, scaledAmt);
    return [scaledAmt, displayUnit].filter(Boolean).join(' ');
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Ingredients</h2>
          {scaledServings && scale !== 1 && (
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {scaledServings} servings
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Scale toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {SCALE_LABELS.map(({ factor, label }) => (
              <button
                key={factor}
                onClick={() => setScale(factor)}
                className="px-3 py-1.5 text-sm font-semibold transition-all"
                style={{
                  background: scale === factor ? 'var(--accent)' : 'var(--card)',
                  color: scale === factor ? 'white' : 'var(--muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Metric toggle */}
          {hasAnyMetric && (
            <button
              onClick={toggleMetric}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
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
