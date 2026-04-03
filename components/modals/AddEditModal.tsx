'use client';

import { useState } from 'react';
import Modal from './Modal';
import { todayISO, daysBetween } from '@/lib/logic';
import { uploadPhoto } from '@/lib/storage';
import { createClient } from '@/lib/supabase-browser';
import type { Product, FinishedProduct, DurationHistory } from '@/types';

const CATEGORIES = [
  'Moisturizer','Serum','Sunscreen','Cleanser','Toner',
  'Eye Cream','Mask','Face Oil','Exfoliant','Other',
];

type Rating = 'loved' | 'ok' | 'wont-repurchase';

interface AddEditModalProps {
  product?: Product;
  durationHistory: DurationHistory;
  brands: string[];
  onSave: (data: Omit<Product, 'id' | 'user_id'>, newBrand?: string) => Promise<void>;
  onSaveFinished?: (data: Omit<FinishedProduct, 'id' | 'user_id'>) => Promise<void>;
  onClose: () => void;
}

export default function AddEditModal({
  product, brands, onSave, onSaveFinished, onClose,
}: AddEditModalProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? 'Moisturizer');
  const [routine, setRoutine] = useState<Product['routine']>(product?.routine ?? 'Both');
  const [sizeValue, setSizeValue] = useState<number | null>(product?.size_value ?? null);
  const [sizeUnit, setSizeUnit] = useState<'ml' | 'g' | 'oz'>(product?.size_unit ?? 'ml');
  const [startDate, setStartDate] = useState(product?.start_date ?? todayISO());
  const [initialRemaining, setInitialRemaining] = useState(product?.initial_remaining ?? 100);
  const [hasBackup, setHasBackup] = useState(product?.has_backup ?? false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(product?.photo_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingBrand, setPendingBrand] = useState<string | null>(null);

  // Finished flow
  const [showFinished, setShowFinished] = useState(false);
  const [finishDate, setFinishDate] = useState(todayISO());
  const [rating, setRating] = useState<Rating | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  const firstWord = name.trim().split(' ')[0];
  const isNewBrand = firstWord.length > 2 &&
    !brands.some(b => b.toLowerCase() === firstWord.toLowerCase()) &&
    pendingBrand !== firstWord;

  async function getPhotoUrl(): Promise<string | null> {
    if (photoFile) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      return uploadPhoto(photoFile, user!.id);
    }
    return product?.photo_url ?? null;
  }

  async function handleSave() {
    if (!name.trim()) { setError('Product name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      const photoUrl = await getPhotoUrl();
      await onSave({
        name: name.trim(), category, routine,
        photo_url: photoUrl,
        start_date: startDate,
        created_at: product?.created_at ?? new Date().toISOString(),
        duration: null, size_value: sizeValue, size_unit: sizeUnit,
        initial_remaining: initialRemaining, has_backup: hasBackup,
      }, pendingBrand ?? undefined);
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'An error occurred';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveFinished() {
    if (!name.trim()) { setError('Product name is required.'); return; }
    if (!onSaveFinished) return;
    setSaving(true);
    setError(null);
    try {
      const photoUrl = await getPhotoUrl();
      const daysUsed = Math.max(1, daysBetween(startDate, finishDate));
      const actualDuration = Math.round(daysUsed * (100 / Math.max(1, initialRemaining)));
      await onSaveFinished({
        name: name.trim(), category,
        photo_url: photoUrl,
        start_date: startDate,
        finish_date: finishDate,
        actual_duration: actualDuration,
        rating,
        created_at: new Date().toISOString(),
      });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'An error occurred';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid var(--border)', borderRadius: '8px',
    padding: '8px 12px', fontSize: '14px', width: '100%',
    background: 'var(--bg)', color: 'var(--text)',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)',
  };
  const ratingOptions: { value: Rating; label: string }[] = [
    { value: 'loved', label: '😍 Loved it' },
    { value: 'ok', label: '😐 It was ok' },
    { value: 'wont-repurchase', label: "👎 Won't repurchase" },
  ];

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
        {product ? 'Edit product' : 'Add product'}
      </h2>

      {/* Photo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Photo (optional)</label>
        <label style={{
          width: '100%', height: '80px', borderRadius: '8px',
          background: 'var(--bg)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
          fontSize: '28px', color: 'var(--border)',
        }}>
          {photoPreview
            ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <span>📷</span>}
          <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Product name *</label>
        <input
          list="brand-list"
          value={name}
          onChange={e => { setName(e.target.value); setPendingBrand(null); }}
          placeholder="e.g. CeraVe Moisturising Cream"
          style={inputStyle}
        />
        <datalist id="brand-list">
          {brands.map(b => <option key={b} value={b} />)}
        </datalist>
        {isNewBrand && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Add &quot;{firstWord}&quot; as a brand for future suggestions?{' '}
            <button type="button" onClick={() => setPendingBrand(firstWord)}
              style={{ background: 'none', border: 'none', color: 'var(--accent1)', fontWeight: 600, cursor: 'pointer', fontSize: '12px', padding: 0 }}>
              Yes
            </button>
          </p>
        )}
      </div>

      {/* Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Routine */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Routine</label>
        <select value={routine} onChange={e => setRoutine(e.target.value as Product['routine'])} style={inputStyle}>
          <option value="Morning">🌅 Morning</option>
          <option value="Evening">🌙 Evening</option>
          <option value="Both">🌅🌙 Both</option>
        </select>
      </div>

      {/* Size */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Bottle size</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            inputMode="decimal"
            value={sizeValue ?? ''}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9.]/g, '');
              setSizeValue(v === '' ? null : parseFloat(v));
            }}
            placeholder="e.g. 200"
            style={{ ...inputStyle, flex: 1 }}
          />
          <select value={sizeUnit} onChange={e => setSizeUnit(e.target.value as 'ml' | 'g' | 'oz')} style={{ ...inputStyle, width: '80px' }}>
            <option value="ml">ml</option>
            <option value="g">g</option>
            <option value="oz">oz</option>
          </select>
        </div>
      </div>

      {/* Date opened */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Date opened</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
      </div>

      {/* % remaining — hidden when logging as finished */}
      {!showFinished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>
            % remaining when added: <strong>{initialRemaining}%</strong>
          </label>
          <input type="range" min={0} max={100} value={initialRemaining}
            onChange={e => setInitialRemaining(parseInt(e.target.value, 10))}
            style={{ border: 'none', padding: 0, width: '100%' }} />
        </div>
      )}

      {/* Backup — hidden when logging as finished */}
      {!showFinished && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '14px' }}>I have a sealed backup</label>
          <input type="checkbox" checked={hasBackup} onChange={e => setHasBackup(e.target.checked)} />
        </div>
      )}

      {/* Already finished toggle */}
      {!product && onSaveFinished && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <button
            type="button"
            onClick={() => setShowFinished(v => !v)}
            style={{
              background: 'none', border: 'none', color: 'var(--accent1)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0,
            }}
          >
            {showFinished ? '↑ Hide' : 'Already finished this product?'}
          </button>

          {showFinished && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              {/* Finish date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Date finished</label>
                <input type="date" value={finishDate} onChange={e => setFinishDate(e.target.value)} style={inputStyle} />
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>How was it?</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ratingOptions.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setRating(opt.value)}
                      style={{
                        fontSize: '13px', color: 'var(--text)',
                        background: rating === opt.value ? 'var(--surface-raised)' : 'none',
                        border: `2px solid ${rating === opt.value ? 'var(--accent1)' : 'var(--border)'}`,
                        borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontWeight: 600,
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: '13px', color: 'var(--red)', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={onClose}
          style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
          Cancel
        </button>
        {showFinished ? (
          <button onClick={handleSaveFinished} disabled={saving}
            style={{ background: 'var(--accent2)', color: '#1e1510', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Log as finished'}
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving}
            style={{ background: 'var(--accent1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
    </Modal>
  );
}
