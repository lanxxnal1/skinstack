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
    <section style={{ padding: '28px 32px 40px' }}>
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '28px',
        marginBottom: '18px',
      }}>
        <h2 style={{
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          margin: 0,
        }}>
          Finished products
        </h2>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {products.map(p => (
          <ArchiveCard key={p.id} product={p} onClick={() => setSelected(p)} />
        ))}
      </div>
      {selected && <ArchiveDetailModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
