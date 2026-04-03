import ProductCard from './ProductCard';
import type { Product } from '@/types';

const ROUTINES = ['Morning', 'Evening', 'Both'] as const;
const ROUTINE_LABEL: Record<string, string> = {
  Morning: '🌅 Morning',
  Evening: '🌙 Evening',
  Both: '🌅🌙 All routines',
};

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  onMenu: (id: string) => void;
  onFinish: (id: string) => void;
}

export default function ProductGrid({ products, searchQuery, onMenu, onFinish }: ProductGridProps) {
  const q = searchQuery.toLowerCase();
  const filtered = q
    ? products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.routine.toLowerCase().includes(q)
      )
    : products;

  if (!filtered.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '48px' }}>🧴</div>
        <p style={{ marginTop: '8px', fontSize: '14px' }}>
          {q ? 'No products match your search.' : 'No products yet — add your first one!'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      {ROUTINES.map(routine => {
        const inRoutine = filtered.filter(p => p.routine === routine);
        if (!inRoutine.length) return null;

        const byCategory: Record<string, Product[]> = {};
        inRoutine.forEach(p => {
          if (!byCategory[p.category]) byCategory[p.category] = [];
          byCategory[p.category].push(p);
        });

        return (
          <div key={routine} style={{ padding: '20px 24px' }}>
            {/* Routine section label */}
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: '14px', paddingBottom: '8px',
              borderBottom: '1px solid var(--border)',
            }}>
              {ROUTINE_LABEL[routine]}
            </div>
            {Object.entries(byCategory).map(([cat, catProducts]) => (
              <div key={cat} style={{ marginBottom: '20px' }}>
                {/* Category sub-label */}
                <div style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                  marginBottom: '10px',
                }}>
                  {cat}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                }}>
                  {catProducts.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      allProducts={products}
                      onMenu={onMenu}
                      onFinish={onFinish}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
