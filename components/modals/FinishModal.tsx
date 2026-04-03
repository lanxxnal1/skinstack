'use client';

import { useState } from 'react';
import Modal from './Modal';
import { todayISO, daysBetween } from '@/lib/logic';
import { uploadPhoto } from '@/lib/storage';
import { createClient } from '@/lib/supabase-browser';
import type { Product, FinishedProduct } from '@/types';

type Rating = 'loved' | 'ok' | 'wont-repurchase';

interface FinishModalProps {
  product: Product;
  onConfirm: (finished: Omit<FinishedProduct, 'id' | 'user_id'>) => Promise<void>;
  onClose: () => void;
}

export default function FinishModal({ product, onConfirm, onClose }: FinishModalProps) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        photoUrl = await uploadPhoto(photoFile, user!.id);
      }
      const finishDate = todayISO();
      const daysUsed = Math.max(1, daysBetween(product.start_date, finishDate));
      const actualDuration = Math.round(daysUsed * (100 / product.initial_remaining));
      await onConfirm({
        name: product.name, category: product.category,
        photo_url: photoUrl,
        start_date: product.start_date, finish_date: finishDate,
        actual_duration: actualDuration, rating,
        created_at: new Date().toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const ratingOptions: { value: Rating; label: string }[] = [
    { value: 'loved', label: '😍 Loved it' },
    { value: 'ok', label: '😐 It was ok' },
    { value: 'wont-repurchase', label: "👎 Won't repurchase" },
  ];

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Finishing {product.name} 🎉</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Photo of empty bottle (optional)
        </label>
        <label style={{
          width: '100%', height: '80px', borderRadius: '8px', background: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', fontSize: '28px', color: 'var(--border)',
        }}>
          {photoPreview
            ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span>📷</span>}
          <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>How was it?</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ratingOptions.map(opt => (
            <button key={opt.value} onClick={() => setRating(opt.value)}
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

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={onClose}
          style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
          Cancel
        </button>
        <button onClick={handleConfirm} disabled={saving}
          style={{ background: 'var(--accent1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Confirm finished'}
        </button>
      </div>
    </Modal>
  );
}
