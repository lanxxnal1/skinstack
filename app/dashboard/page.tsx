'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';
import {
  fetchProducts, insertProduct, updateProduct, deleteProduct as dbDeleteProduct,
  fetchFinishedProducts, insertFinishedProduct, insertDurationHistory,
  fetchDurationHistory, fetchBrands, insertBrand,
} from '@/lib/data';
import StatsBar from '@/components/StatsBar';
import ProductGrid from '@/components/ProductGrid';
import ArchiveSection from '@/components/ArchiveSection';
import AddEditModal from '@/components/modals/AddEditModal';
import ProductDetailModal from '@/components/modals/ProductDetailModal';
import FinishModal from '@/components/modals/FinishModal';
import OnboardingModal from '@/components/modals/OnboardingModal';
import type { Product, FinishedProduct, DurationHistory } from '@/types';

const ONBOARDING_KEY = 'skinstack_onboarded';

type ActiveModal =
  | { type: 'add' }
  | { type: 'edit'; productId: string }
  | { type: 'detail'; productId: string }
  | { type: 'finish'; productId: string }
  | { type: 'onboarding' };

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [finished, setFinished] = useState<FinishedProduct[]>([]);
  const [durationHistory, setDurationHistory] = useState<DurationHistory>({ byProduct: {}, byCategory: {} });
  const [brands, setBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ActiveModal | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [p, f, dh, b] = await Promise.all([
        fetchProducts(),
        fetchFinishedProducts(),
        fetchDurationHistory(),
        fetchBrands(),
      ]);
      setProducts(p);
      setFinished(f);
      setDurationHistory(dh);
      setBrands(b);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setTimeout(() => setModal({ type: 'onboarding' }), 300);
    }
  }, [load]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  async function handleSaveProduct(data: Omit<Product, 'id' | 'user_id'>, newBrand?: string) {
    if (modal?.type === 'edit') {
      await updateProduct(modal.productId, data);
    } else {
      await insertProduct(data);
    }
    if (newBrand) {
      await insertBrand(newBrand);
      setBrands(prev => [...prev, newBrand].sort());
    }
    await load();
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await dbDeleteProduct(id);
    setModal(null);
    await load();
  }

  async function handleFinishProduct(
    productId: string,
    finishedData: Omit<FinishedProduct, 'id' | 'user_id'>
  ) {
    setModal(null);
    setProducts(prev => prev.filter(p => p.id !== productId));
    try {
      await insertFinishedProduct(finishedData);
      await insertDurationHistory(finishedData.name, finishedData.category, finishedData.actual_duration);
      await dbDeleteProduct(productId);
    } catch (e) {
      console.error('Failed to finish product:', e);
      alert('Error: ' + (e instanceof Error ? e.message : (e as {message?:string})?.message ?? String(e)));
    }
    await load();
  }

  async function handleOnboardingDone(newProducts: Omit<Product, 'id' | 'user_id'>[]) {
    try {
      await Promise.all(newProducts.map(p => insertProduct(p)));
      localStorage.setItem(ONBOARDING_KEY, '1');
      setModal(null);
      await load();
    } catch (err) {
      console.error('Onboarding save failed', err);
    }
  }

  const activeProduct = modal?.type === 'edit' || modal?.type === 'detail' || modal?.type === 'finish'
    ? products.find(p => p.id === modal.productId)
    : undefined;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
      </div>
    );
  }

  return (
    <>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--header-bg)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>
          Skin<span style={{ color: 'var(--accent1)' }}>Stack</span>
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setModal({ type: 'add' })}
            style={{ background: 'var(--accent1)', color: 'var(--header-bg)', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Add
          </button>
          <button
            onClick={handleSignOut}
            style={{ background: 'var(--border)', color: 'var(--text)', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ padding: '16px 24px 0' }}>
          <input
            type="search"
            placeholder="Search products…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ maxWidth: '380px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '100%', color: 'var(--text)' }}
          />
        </div>
        <StatsBar products={products} />
        <ProductGrid
          products={products}
          searchQuery={searchQuery}
          onTap={id => setModal({ type: 'detail', productId: id })}
        />
        <ArchiveSection products={finished} />
      </main>

      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <AddEditModal
          product={modal.type === 'edit' ? activeProduct : undefined}
          durationHistory={durationHistory}
          brands={brands}
          onSave={handleSaveProduct}
          onSaveFinished={modal.type === 'add' ? async (data) => {
            await insertFinishedProduct(data);
            await insertDurationHistory(data.name, data.category, data.actual_duration);
            await load();
          } : undefined}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'detail' && activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          allProducts={products}
          onEdit={() => setModal({ type: 'edit', productId: activeProduct.id })}
          onFinish={() => setModal({ type: 'finish', productId: activeProduct.id })}
          onDelete={() => handleDeleteProduct(activeProduct.id)}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'finish' && activeProduct && (
        <FinishModal
          product={activeProduct}
          onConfirm={data => handleFinishProduct(activeProduct.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'onboarding' && (
        <OnboardingModal
          durationHistory={durationHistory}
          onDone={handleOnboardingDone}
          onSkip={() => {
            localStorage.setItem(ONBOARDING_KEY, '1');
            setModal(null);
          }}
        />
      )}
    </>
  );
}
