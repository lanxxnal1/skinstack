import { describe, it, expect } from 'vitest';
import { calcProgress, getStatus, estimateDuration } from '@/lib/logic';
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
  initial_remaining: 100,
  has_backup: false,
  ...overrides,
});

describe('calcProgress', () => {
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
