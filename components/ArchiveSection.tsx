'use client';

import { useState } from 'react';
import ArchiveCard from './ArchiveCard';
import ArchiveDetailModal from './modals/ArchiveDetailModal';
import type { FinishedProduct } from '@/types';

interface ArchiveSectionProps {
  products: FinishedProduct[];
}

export default function ArchiveSection({ products }: ArchiveSectionProps) {
  const [selected, setSelected] = useState<FinishedProduct | null>(null);

  if (!products.length) return null;

  return (
    <section style={{ marginTop: '8px', padding: '0 0 24px' }}>
      <div style={{
        padding: '20px 24px 12px',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          margin: 0,
        }}>
          Finished products
        </h2>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px', padding: '0 24px',
      }}>
        {products.map(p => (
          <ArchiveCard key={p.id} product={p} onClick={() => setSelected(p)} />
        ))}
      </div>
      {selected && <ArchiveDetailModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
