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
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '14px 16px',
        opacity: 0.8,
        display: 'flex', flexDirection: 'column', gap: '6px',
        cursor: 'pointer', transition: 'opacity 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.opacity = '1';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.opacity = '0.8';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{product.name}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{product.category}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        Lasted {product.actual_duration} days · Finished {product.finish_date}
        {product.rating ? ` · ${RATING_EMOJI[product.rating]}` : ''}
        {product.photo_url ? ' · 📷' : ''}
      </div>
    </div>
  );
}
