import { describe, it, expect } from 'vitest';
import { calcProgress, getStatus, estimateDuration, estimateUsageRate } from '@/lib/logic';
import type { Product, DurationHistory } from '@/types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  user_id: 'u1',
  name: 'Test Moisturiser',
  category: 'Moisturizer',
  routine: 'Both',
  photo_url: null,
  start_date: '2026-01-01',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  duration: 60,
  size_value: null,
  size_unit: null,
  initial_remaining: 100,
  has_backup: false,
  ...overrides,
});

describe('calcProgress (legacy path — no size_value)', () => {
  it('returns 50% after half the duration has passed', () => {
    const product = makeProduct({
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      duration: 60,
      initial_remaining: 100,
    });
    const { currentPct, daysLeft } = calcProgress(product);
    expect(currentPct).toBe(50);
    expect(daysLeft).toBe(30);
  });

  it('never returns negative percentage', () => {
    const product = makeProduct({
      created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
      duration: 60,
      initial_remaining: 100,
    });
    const { currentPct } = calcProgress(product);
    expect(currentPct).toBe(0);
  });

  it('accounts for initial remaining < 100%', () => {
    const product = makeProduct({
      created_at: new Date(Date.now() - 0).toISOString(),
      duration: 60,
      initial_remaining: 50,
    });
    const { currentPct } = calcProgress(product);
    expect(currentPct).toBe(50);
  });
});

describe('calcProgress (size-based path)', () => {
  it('returns correct % with size_value set', () => {
    // 200ml bottle, usage rate 1.5ml/day (Moisturizer default), 0 days elapsed
    const product = makeProduct({
      created_at: new Date(Date.now() - 0).toISOString(),
      size_value: 200,
      size_unit: 'ml',
      initial_remaining: 100,
      duration: null,
    });
    const { currentPct, daysLeft } = calcProgress(product);
    expect(currentPct).toBe(100);
    // daysLeft = 200 / 1.5 ≈ 133
    expect(daysLeft).toBe(133);
  });

  it('decreases correctly as days pass', () => {
    // 200ml bottle, 1.5ml/day, 20 days elapsed → 200 - 30 = 170ml remaining → 85%
    const product = makeProduct({
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      size_value: 200,
      size_unit: 'ml',
      initial_remaining: 100,
      duration: null,
    });
    const { currentPct, daysLeft } = calcProgress(product);
    expect(currentPct).toBe(85);
    // daysLeft = 170 / 1.5 ≈ 113
    expect(daysLeft).toBe(113);
  });

  it('accounts for initial_remaining < 100% with size_value', () => {
    // 200ml bottle, 50% initial → 100ml at start, 0 days elapsed
    const product = makeProduct({
      created_at: new Date(Date.now() - 0).toISOString(),
      size_value: 200,
      size_unit: 'ml',
      initial_remaining: 50,
      duration: null,
    });
    const { currentPct, daysLeft } = calcProgress(product);
    expect(currentPct).toBe(50);
    // daysLeft = 100ml / 1.5ml/day ≈ 67
    expect(daysLeft).toBe(67);
  });

  it('never returns negative values', () => {
    // 200ml bottle, 1.5ml/day, 200 days elapsed → deeply overdue
    const product = makeProduct({
      created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
      size_value: 200,
      size_unit: 'ml',
      initial_remaining: 100,
      duration: null,
    });
    const { currentPct, daysLeft } = calcProgress(product);
    expect(currentPct).toBe(0);
    expect(daysLeft).toBe(0);
  });

  it('uses history-based usage rate when provided', () => {
    // history says 2ml/day for this product
    const history: DurationHistory = {
      byProduct: { 'Test Moisturiser': [2] },
      byCategory: {},
    };
    const product = makeProduct({
      created_at: new Date(Date.now() - 0).toISOString(),
      size_value: 200,
      size_unit: 'ml',
      initial_remaining: 100,
      duration: null,
    });
    const { daysLeft } = calcProgress(product, history);
    // daysLeft = 200 / 2 = 100
    expect(daysLeft).toBe(100);
  });
});

describe('getStatus', () => {
  it('returns normal for healthy product', () => {
    expect(getStatus(80, 50, 'Moisturizer', 'Both', [])).toBe('normal');
  });

  it('returns restock-soon when 14 days or fewer left', () => {
    expect(getStatus(30, 14, 'Moisturizer', 'Both', [])).toBe('restock-soon');
  });

  it('returns restock-now when 3 days or fewer left', () => {
    expect(getStatus(10, 3, 'Moisturizer', 'Both', [])).toBe('restock-now');
  });

  it('returns nearly-empty when under 10% but more than 14 days left', () => {
    expect(getStatus(5, 20, 'Moisturizer', 'Both', [])).toBe('nearly-empty');
  });

  it('returns expired when 0 days left', () => {
    expect(getStatus(0, 0, 'Moisturizer', 'Both', [])).toBe('expired');
  });
});

describe('estimateUsageRate', () => {
  it('returns product-level estimate when available', () => {
    const history: DurationHistory = {
      byProduct: { 'CeraVe': [2, 3] },
      byCategory: {},
    };
    expect(estimateUsageRate('CeraVe', 'Moisturizer', history)).toBe(3);
  });

  it('falls back to category estimate', () => {
    const history: DurationHistory = {
      byProduct: {},
      byCategory: { Moisturizer: [1.0, 2.0] },
    };
    expect(estimateUsageRate('Unknown', 'Moisturizer', history)).toBe(2);
  });

  it('falls back to default when no history', () => {
    const history: DurationHistory = { byProduct: {}, byCategory: {} };
    // Moisturizer default is 1.5ml/day
    expect(estimateUsageRate('Unknown', 'Moisturizer', history)).toBe(1.5);
  });

  it('falls back to Other default for unknown category', () => {
    const history: DurationHistory = { byProduct: {}, byCategory: {} };
    expect(estimateUsageRate('Unknown', 'UnknownCategory', history)).toBe(1.0);
  });
});

describe('estimateDuration', () => {
  it('returns product-level estimate when available', () => {
    const history: DurationHistory = {
      byProduct: { 'CeraVe': [60, 70] },
      byCategory: {},
    };
    expect(estimateDuration('CeraVe', 'Moisturizer', history)).toBe(65);
  });

  it('falls back to category estimate', () => {
    const history: DurationHistory = {
      byProduct: {},
      byCategory: { Moisturizer: [50, 70] },
    };
    expect(estimateDuration('Unknown', 'Moisturizer', history)).toBe(60);
  });

  it('falls back to default when no history', () => {
    const history: DurationHistory = { byProduct: {}, byCategory: {} };
    expect(estimateDuration('Unknown', 'Moisturizer', history)).toBe(60);
  });
});
