import { calcProgress, getStatus } from '@/lib/logic';
import type { Product } from '@/types';

interface StatsBarProps {
  products: Product[];
}

export default function StatsBar({ products }: StatsBarProps) {
  const restockCount = products.filter(p => {
    const { currentPct, daysLeft } = calcProgress(p);
    const s = getStatus(currentPct, daysLeft, p.category, p.routine, products);
    return s === 'restock-now' || s === 'restock-soon' || s === 'nearly-empty';
  }).length;

  const avgDays = products.length
    ? Math.round(products.reduce((sum, p) => sum + calcProgress(p).daysLeft, 0) / products.length)
    : null;

  const statStyle = { display: 'flex', flexDirection: 'column' as const, gap: '3px' };
  const valueStyle = { fontSize: '22px', fontWeight: 800, color: 'var(--text)' };
  const labelStyle = {
    fontSize: '11px', color: 'var(--text-muted)',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  };

  return (
    <div style={{
      display: 'flex', gap: '32px', padding: '14px 24px', flexWrap: 'wrap' as const,
      background: 'var(--header-bg)', borderBottom: '1px solid var(--border)',
    }}>
      <div style={statStyle}>
        <span style={valueStyle}>{products.length}</span>
        <span style={labelStyle}>Tracked</span>
      </div>
      <div style={statStyle}>
        <span style={valueStyle}>{restockCount}</span>
        <span style={labelStyle}>Need restocking</span>
      </div>
      <div style={statStyle}>
        <span style={valueStyle}>{avgDays ?? '—'}</span>
        <span style={labelStyle}>Avg days left</span>
      </div>
    </div>
  );
}
