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
    <section style={{ marginTop: '8px' }}>
      <h2 style={{ padding: '0 24px 12px', fontSize: '16px', color: 'var(--text-muted)', fontWeight: 700 }}>
        Finished products
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px', padding: '0 24px 24px',
      }}>
        {products.map(p => (
          <ArchiveCard key={p.id} product={p} onClick={() => setSelected(p)} />
        ))}
      </div>
      {selected && <ArchiveDetailModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
