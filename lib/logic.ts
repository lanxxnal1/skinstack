import type { Product, ProductProgress, ProductStatus, DurationHistory } from '@/types';

const DURATION_DEFAULTS: Record<string, number> = {
  Moisturizer: 60, Serum: 90, Sunscreen: 30, Cleanser: 45,
  Toner: 60, 'Eye Cream': 90, Mask: 120, 'Face Oil': 90,
  Exfoliant: 90, Other: 60,
};

const USAGE_RATE_DEFAULTS: Record<string, number> = {
  Moisturizer: 1.5,
  Serum: 0.5,
  Sunscreen: 2.0,
  Cleanser: 3.0,
  Toner: 3.0,
  'Eye Cream': 0.3,
  Mask: 5.0,
  'Face Oil': 0.5,
  Exfoliant: 2.0,
  Other: 1.0,
};

export function daysBetween(isoA: string, isoB: string): number {
  return Math.floor((new Date(isoB).getTime() - new Date(isoA).getTime()) / 86400000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function average(arr: number[]): number | null {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
}

export function estimateUsageRate(
  name: string,
  category: string,
  history: DurationHistory
): number {
  const byProduct = history.byProduct?.[name];
  if (byProduct?.length) return average(byProduct)!;
  const byCat = history.byCategory?.[category];
  if (byCat?.length) return average(byCat)!;
  return USAGE_RATE_DEFAULTS[category] ?? USAGE_RATE_DEFAULTS.Other;
}

export function estimateDuration(
  name: string,
  category: string,
  history: DurationHistory
): number {
  const byProduct = history.byProduct?.[name];
  if (byProduct?.length) return average(byProduct)!;
  const byCat = history.byCategory?.[category];
  if (byCat?.length) return average(byCat)!;
  return DURATION_DEFAULTS[category] ?? DURATION_DEFAULTS.Other;
}

export function calcProgress(product: Product, history?: DurationHistory): ProductProgress {
  if (product.size_value != null) {
    // New size-based path
    const usageRate = estimateUsageRate(
      product.name,
      product.category,
      history ?? { byProduct: {}, byCategory: {} }
    );
    const totalMl = product.size_value;
    const daysSinceAdded = daysBetween(product.created_at.slice(0, 10), todayISO());
    const mlUsed = daysSinceAdded * usageRate;
    const mlRemaining = (product.initial_remaining / 100) * totalMl - mlUsed;
    const currentPct = Math.max(0, (mlRemaining / totalMl) * 100);
    const daysLeft = Math.max(0, mlRemaining / usageRate);
    return { currentPct: Math.round(currentPct), daysLeft: Math.round(daysLeft) };
  } else {
    // Legacy path: use duration or DURATION_DEFAULTS
    const duration = product.duration ?? DURATION_DEFAULTS[product.category] ?? DURATION_DEFAULTS.Other;
    const usagePerDay = 100 / Math.max(1, duration);
    const daysSinceAdded = daysBetween(product.created_at.slice(0, 10), todayISO());
    const currentPct = Math.max(0, product.initial_remaining - daysSinceAdded * usagePerDay);
    const daysLeft = Math.round(currentPct / usagePerDay);
    return { currentPct: Math.round(currentPct), daysLeft };
  }
}

export function getStatus(
  currentPct: number,
  daysLeft: number,
  category: string,
  routine: string,
  allActive: Product[],
  history?: DurationHistory
): ProductStatus {
  const r = routine ?? 'Both';
  const sameGroup = allActive.filter(p =>
    p.category === category &&
    (p.routine === r || p.routine === 'Both' || r === 'Both')
  );
  if (sameGroup.length >= 2) {
    const combined = sameGroup.reduce((sum, p) => sum + calcProgress(p, history).daysLeft, 0);
    if (combined > 180) return 'overstocked';
  }
  if (daysLeft === 0) return 'expired';
  if (currentPct < 10) return 'nearly-empty';
  if (daysLeft <= 3) return 'restock-now';
  if (daysLeft <= 14) return 'restock-soon';
  return 'normal';
}
