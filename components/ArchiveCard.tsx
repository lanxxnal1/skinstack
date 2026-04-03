'use client';

import CategoryImage from './CategoryImage';
import type { FinishedProduct } from '@/types';

const RATING_LABEL: Record<string, string> = {
  loved: '😍 Loved it',
  ok: '😐 It was ok',
  'wont-repurchase': "👎 Won't repurchase",
};

interface ArchiveCardProps {
  product: FinishedProduct;
  onClick: () => void;
}

export default function ArchiveCard({ product, onClick }: ArchiveCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        opacity: 0.85,
        display: 'flex', flexDirection: 'column', gap: '14px',
        cursor: 'pointer', transition: 'opacity 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.opacity = '1';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.opacity = '0.85';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
    >
      {/* Photo area */}
      <div style={{
        width: '100%', height: '160px', borderRadius: '10px',
        background: 'var(--surface-raised)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {product.photo_url
          ? <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <CategoryImage category={product.category} size={72} />
        }
      </div>

      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>{product.name}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-8px' }}>{product.category}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px',
          background: 'var(--surface-raised)', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          {product.rating ? RATING_LABEL[product.rating] : 'Finished'}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {product.actual_duration}d · {product.finish_date}
        </span>
      </div>
    </div>
  );
}
