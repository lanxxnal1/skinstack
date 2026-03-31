export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  routine: 'Morning' | 'Evening' | 'Both';
  photo_url: string | null;
  start_date: string;       // ISO date e.g. "2026-03-01"
  created_at: string;       // ISO timestamp
  duration: number;         // full-bottle lifespan in days
  initial_remaining: number; // % when added (0-100)
  has_backup: boolean;
}

export interface FinishedProduct {
  id: string;
  user_id: string;
  name: string;
  category: string;
  photo_url: string | null;
  start_date: string;
  finish_date: string;
  actual_duration: number;
  rating: 'loved' | 'ok' | 'wont-repurchase' | null;
  created_at: string;
}

export interface DurationHistory {
  byProduct: Record<string, number[]>;
  byCategory: Record<string, number[]>;
}

export type ProductStatus =
  | 'normal'
  | 'restock-soon'
  | 'restock-now'
  | 'overstocked'
  | 'nearly-empty'
  | 'expired';

export interface ProductProgress {
  currentPct: number;
  daysLeft: number;
}
