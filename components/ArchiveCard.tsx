'use client';

import type { FinishedProduct } from '@/types';

const RATING_EMOJI: Record<string, string> = {
  loved: '😍',
  ok: '😐',
  'wont-repurchase': '👎',
};

interface ArchiveCardProps {
  product: FinishedProduct;
  onClick: () => void;
}

export default function ArchiveCard({ product, onClick }: ArchiveCardProps) {
  return (
    <div onClick={onClick}
      style={{
        background: 'var(--surface)', borderRadius: '14px',
        boxShadow: '0 2px 12px rgba(61,43,31,0.08)',
        padding: '14px 16px', opacity: 0.75,
        display: 'flex', flexDirection: 'column', gap: '6px',
        cursor: 'pointer', transition: 'opacity 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.opacity = '1';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(61,43,31,0.13)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.opacity = '0.75';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(61,43,31,0.08)';
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 700 }}>{product.name}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.category}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Lasted {product.actual_duration} days · Finished {product.finish_date}
        {product.rating ? ` · ${RATING_EMOJI[product.rating]}` : ''}
        {product.photo_url ? ' · 📷' : ''}
      </div>
    </div>
  );
}
