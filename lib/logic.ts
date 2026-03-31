import type { Product, ProductProgress, ProductStatus, DurationHistory } from '@/types';

const DURATION_DEFAULTS: Record<string, number> = {
  Moisturizer: 60, Serum: 90, Sunscreen: 30, Cleanser: 45,
  Toner: 60, 'Eye Cream': 90, Mask: 120, 'Face Oil': 90,
  Exfoliant: 90, Other: 60,
};

export function daysBetween(isoA: string, isoB: string): number {
  return Math.floor((new Date(isoB).getTime() - new Date(isoA).getTime()) / 86400000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calcProgress(product: Product): ProductProgress {
  const addedDate = product.created_at.slice(0, 10);
  const daysSinceAdded = daysBetween(addedDate, todayISO());
  const usagePerDay = 100 / Math.max(1, product.duration);
  const currentPct = Math.max(0, product.initial_remaining - daysSinceAdded * usagePerDay);
  const daysLeft = Math.round(currentPct / usagePerDay);
  return { currentPct: Math.round(currentPct), daysLeft };
}

export function getStatus(
  currentPct: number,
  daysLeft: number,
  category: string,
  routine: string,
  allActive: Product[]
): ProductStatus {
  const r = routine ?? 'Both';
  const sameGroup = allActive.filter(p =>
    p.category === category &&
    (p.routine === r || p.routine === 'Both' || r === 'Both')
  );
  if (sameGroup.length >= 2) {
    const combined = sameGroup.reduce((sum, p) => sum + calcProgress(p).daysLeft, 0);
    if (combined > 180) return 'overstocked';
  }
  if (daysLeft === 0) return 'expired';
  if (currentPct < 10) return 'nearly-empty';
  if (daysLeft <= 3) return 'restock-now';
  if (daysLeft <= 14) return 'restock-soon';
  return 'normal';
}

function average(arr: number[]): number | null {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
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
