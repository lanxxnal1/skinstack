import { calcProgress, getStatus } from '@/lib/logic';
import type { Product, ProductStatus } from '@/types';

const STATUS_LABEL: Record<ProductStatus, string> = {
  normal:         '✓ Good supply',
  'restock-soon': '⚠ Restock soon',
  'restock-now':  '🔴 Restock now',
  overstocked:    '📦 Overstocked',
  'nearly-empty': '⬇ Nearly empty',
  expired:        '⏰ Expired',
};

const BADGE_COLOR: Record<ProductStatus, { bg: string; color: string }> = {
  normal:         { bg: '#e8f5ee', color: 'var(--green)' },
  'restock-soon': { bg: '#fff4e0', color: 'var(--yellow)' },
  'restock-now':  { bg: '#fde8e6', color: 'var(--red)' },
  overstocked:    { bg: '#ece8fd', color: 'var(--purple)' },
  'nearly-empty': { bg: '#fff4e0', color: 'var(--yellow)' },
  expired:        { bg: '#fde8e6', color: 'var(--red)' },
};

interface ProductCardProps {
  product: Product;
  allProducts: Product[];
  onMenu: (id: string) => void;
  onFinish: (id: string) => void;
}

export default function ProductCard({ product, allProducts, onMenu, onFinish }: ProductCardProps) {
  const { currentPct, daysLeft } = calcProgress(product);
  const status = getStatus(currentPct, daysLeft, product.category, product.routine, allProducts);
  const badge = BADGE_COLOR[status];
  const needsAction = status === 'expired' || status === 'nearly-empty';
  const daysText = status === 'expired'
    ? 'Did you finish this?'
    : `~${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: '14px',
      boxShadow: '0 2px 12px rgba(61,43,31,0.08)',
      padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
      position: 'relative',
    }}>
      <button
        onClick={() => onMenu(product.id)}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '18px', color: 'var(--text-muted)', padding: '4px',
        }}
        aria-label="Product menu"
      >
        ⋯
      </button>

      <div style={{
        width: '100%', height: '100px', borderRadius: '8px',
        background: 'var(--bg)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px', color: 'var(--border)',
      }}>
        {product.photo_url
          ? <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>🧴</span>
        }
      </div>

      <div style={{ fontSize: '15px', fontWeight: 700 }}>{product.name}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-6px' }}>
        {product.category}{product.has_backup ? ' · 📦 backup' : ''} · {product.routine}
      </div>

      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          background: 'linear-gradient(90deg, var(--accent1), var(--accent2))',
          width: `${currentPct}%`, transition: 'width 0.4s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
          background: badge.bg, color: badge.color,
        }}>
          {STATUS_LABEL[status]}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{daysText}</span>
      </div>

      {needsAction && (
        <button
          onClick={() => onFinish(product.id)}
          style={{
            background: 'var(--accent1)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '6px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer', marginTop: '4px',
          }}
        >
          Mark as finished
        </button>
      )}
    </div>
  );
}
