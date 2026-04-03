'use client';

import Modal from './Modal';
import { calcProgress, getStatus } from '@/lib/logic';
import CategoryImage from '@/components/CategoryImage';
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

const BAR_COLOR: Record<ProductStatus, string> = {
  normal:         'var(--accent1)',
  'restock-soon': 'var(--yellow)',
  'restock-now':  'var(--red)',
  overstocked:    'var(--purple)',
  'nearly-empty': 'var(--red)',
  expired:        'var(--red)',
};

interface ProductDetailModalProps {
  product: Product;
  allProducts: Product[];
  onEdit: () => void;
  onFinish: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ProductDetailModal({
  product, allProducts, onEdit, onFinish, onDelete, onClose,
}: ProductDetailModalProps) {
  const { currentPct, daysLeft } = calcProgress(product);
  const status = getStatus(currentPct, daysLeft, product.category, product.routine, allProducts);
  const badge = BADGE_STYLE[status];
  const daysText = status === 'expired' ? 'Expired' : `~${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;

  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{value}</span>
    </div>
  );

  return (
    <Modal onClose={onClose}>
      {/* Header with edit button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, flex: 1, paddingRight: '12px' }}>{product.name}</h2>
        <button onClick={() => { onClose(); onEdit(); }} style={{
          background: 'var(--border)', border: 'none', borderRadius: '8px',
          padding: '6px 12px', fontSize: '13px', fontWeight: 600,
          color: 'var(--text)', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          Edit
        </button>
      </div>

      {/* Photo */}
      <div style={{
        width: '100%', height: '140px', borderRadius: '10px',
        background: 'var(--surface-raised)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px',
      }}>
        {product.photo_url
          ? <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <CategoryImage category={product.category} size={64} />}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            background: badge.background, color: badge.color,
          }}>
            {STATUS_LABEL[status]}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{currentPct}% · {daysText}</span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            background: BAR_COLOR[status], width: `${currentPct}%`,
          }} />
        </div>
      </div>

      {/* Details */}
      <div>
        {row('Category', product.category)}
        {row('Routine', product.routine)}
        {product.size_value != null && row('Bottle size', `${product.size_value} ${product.size_unit ?? 'ml'}`)}
        {row('Backup', product.has_backup ? 'Yes' : 'No')}
        {row('Date opened', product.start_date)}
      </div>

      {/* Actions */}
      <button onClick={() => { onClose(); onFinish(); }} style={{
        background: 'var(--accent1)', color: 'var(--header-bg)', border: 'none',
        borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 700,
        cursor: 'pointer', width: '100%',
      }}>
        ✅ Mark as finished
      </button>

      <button onClick={onDelete} style={{
        background: 'none', border: 'none', color: 'var(--red)',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '4px 0',
        textAlign: 'center', width: '100%',
      }}>
        Delete product
      </button>
    </Modal>
  );
}
