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

const BADGE_STYLE: Record<ProductStatus, { background: string; color: string }> = {
  normal:         { background: 'var(--green-bg)',  color: 'var(--green)' },
  'restock-soon': { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  'restock-now':  { background: 'var(--red-bg)',    color: 'var(--red)' },
  overstocked:    { background: 'var(--purple-bg)', color: 'var(--purple)' },
  'nearly-empty': { background: 'var(--red-bg)',    color: 'var(--red)' },
  expired:        { background: 'var(--red-bg)',    color: 'var(--red)' },
};

const BAR_COLOR: Record<ProductStatus, string> = {
  normal:         'var(--accent1)',
  'restock-soon': 'var(--yellow)',
  'restock-now':  'var(--red)',
  overstocked:    'var(--purple)',
  'nearly-empty': 'var(--red)',
  expired:        'var(--red)',
};

const CARD_BORDER: Record<ProductStatus, string> = {
  normal:         '1px solid var(--border)',
  'restock-soon': '1px solid var(--border)',
  'restock-now':  '1px solid rgba(232,92,74,0.3)',
  overstocked:    '1px solid var(--border)',
  'nearly-empty': '1px solid rgba(232,92,74,0.3)',
  expired:        '1px solid rgba(232,92,74,0.3)',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Moisturizer: '🫧',
  Serum:       '💧',
  Sunscreen:   '☀️',
  Cleanser:    '🫧',
  Toner:       '💦',
  'Eye Cream': '👁️',
  Mask:        '🎭',
  'Face Oil':  '🌿',
  Exfoliant:   '✨',
  Other:       '🧴',
};

interface ProductCardProps {
  product: Product;
  allProducts: Product[];
  onTap: (id: string) => void;
}

export default function ProductCard({ product, allProducts, onTap }: ProductCardProps) {
  const { currentPct, daysLeft } = calcProgress(product);
  const status = getStatus(currentPct, daysLeft, product.category, product.routine, allProducts);
  const badge = BADGE_STYLE[status];
  const daysText = status === 'expired'
    ? 'Expired'
    : `~${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;

  return (
    <div
      onClick={() => onTap(product.id)}
      style={{
        background: 'var(--surface)',
        border: CARD_BORDER[status],
        borderRadius: '12px',
        padding: '14px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        cursor: 'pointer',
      }}
    >
      {/* Photo area */}
      <div style={{
        width: '100%', height: '80px', borderRadius: '8px',
        background: 'var(--surface-raised)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px',
      }}>
        {product.photo_url
          ? <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{CATEGORY_EMOJI[product.category] ?? '🧴'}</span>
        }
      </div>

      {/* Name + category */}
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{product.name}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-6px' }}>
        {product.category}{product.has_backup ? ' · 📦 backup' : ''} · {product.routine}
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'var(--bg)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          background: BAR_COLOR[status],
          width: `${currentPct}%`, transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Badge + days */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '10px', fontWeight: 700,
          padding: '2px 7px', borderRadius: '99px',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          background: badge.background, color: badge.color,
        }}>
          {STATUS_LABEL[status]}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{daysText}</span>
      </div>
    </div>
  );
}
