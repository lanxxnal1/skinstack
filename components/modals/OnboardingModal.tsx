'use client';

import { useState } from 'react';
import Modal from './Modal';
import { estimateDuration, todayISO } from '@/lib/logic';
import type { Product, DurationHistory } from '@/types';

const CATEGORIES = [
  'Moisturizer','Serum','Sunscreen','Cleanser','Toner',
  'Eye Cream','Mask','Face Oil','Exfoliant','Other',
];

const FILL_OPTIONS = [
  { pct: 100, label: '🟢 Full (~100%)' },
  { pct: 50,  label: '🟡 Half (~50%)' },
  { pct: 15,  label: '🔴 Nearly empty (~15%)' },
];

interface OnboardingModalProps {
  durationHistory: DurationHistory;
  onDone: (products: Omit<Product, 'id' | 'user_id'>[]) => Promise<void>;
  onSkip: () => void;
}

export default function OnboardingModal({ durationHistory, onDone, onSkip }: OnboardingModalProps) {
  const [pending, setPending] = useState<Omit<Product, 'id' | 'user_id'>[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Moisturizer');
  const [fillPct, setFillPct] = useState(100);
  const [routine, setRoutine] = useState<Product['routine']>('Both');
  const [hasBackup, setHasBackup] = useState(false);
  const [step, setStep] = useState<'add' | 'summary'>('add');
  const [saving, setSaving] = useState(false);

  function collectCurrent(): Omit<Product, 'id' | 'user_id'> | null {
    if (!name.trim()) return null;
    return {
      name: name.trim(), category, routine,
      photo_url: null, has_backup: hasBackup,
      start_date: todayISO(),
      created_at: new Date().toISOString(),
      duration: estimateDuration(name.trim(), category, durationHistory),
      size_value: null, size_unit: null,
      initial_remaining: fillPct,
    };
  }

  function handleAddAnother() {
    const p = collectCurrent();
    if (p) setPending(prev => [...prev, p]);
    setName(''); setHasBackup(false); setFillPct(100);
  }

  function handleDone() {
    const p = collectCurrent();
    const all = p ? [...pending, p] : pending;
    if (!all.length) { onSkip(); return; }
    setPending(all);
    setStep('summary');
  }

  async function handleConfirm() {
    setSaving(true);
    await onDone(pending);
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid var(--border)', borderRadius: '8px',
    padding: '8px 12px', fontSize: '14px', width: '100%',
    background: 'var(--surface)', color: 'var(--text)',
  };
  const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' };

  if (step === 'summary') {
    return (
      <Modal onClose={onSkip}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Welcome to SkinStack 🌿</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Added {pending.length} product{pending.length !== 1 ? 's' : ''}. Ready to start tracking!
        </p>
        <button onClick={handleConfirm} disabled={saving}
          style={{ background: 'var(--accent1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {saving ? 'Saving…' : 'Start tracking →'}
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onSkip}>
      <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Welcome to SkinStack 🌿</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
        Let&apos;s add your currently open products so SkinStack can start tracking.
        {pending.length > 0 && ` (${pending.length} added so far)`}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Product name</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. SPF 50 Sunscreen" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={labelStyle}>How full is it?</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FILL_OPTIONS.map(opt => (
            <button key={opt.pct} onClick={() => setFillPct(opt.pct)}
              style={{
                fontSize: '13px',
                background: fillPct === opt.pct ? '#fff4ee' : 'none',
                border: `2px solid ${fillPct === opt.pct ? 'var(--accent1)' : 'var(--border)'}`,
                borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontWeight: 600,
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Routine</label>
        <select value={routine} onChange={e => setRoutine(e.target.value as Product['routine'])} style={inputStyle}>
          <option value="Morning">🌅 Morning</option>
          <option value="Evening">🌙 Evening</option>
          <option value="Both">🌅🌙 Both</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: '14px' }}>I have a sealed backup</label>
        <input type="checkbox" checked={hasBackup} onChange={e => setHasBackup(e.target.checked)} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleAddAnother}
          style={{ flex: 1, background: 'var(--border)', color: 'var(--text)', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          + Add another
        </button>
        <button onClick={handleDone}
          style={{ flex: 1, background: 'var(--accent1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Done adding
        </button>
      </div>

      <button onClick={onSkip}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>
        Skip setup
      </button>
    </Modal>
  );
}
