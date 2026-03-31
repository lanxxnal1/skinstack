'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { insertProduct, insertFinishedProduct, insertDurationHistory } from '@/lib/data';
import { uploadBase64Photo } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface OldProduct {
  id: string; name: string; category: string; routine?: string;
  photo: string | null; startDate: string; createdAt: string;
  duration: number; initialRemaining: number; hasBackup: boolean;
}

interface OldFinished {
  id: string; name: string; category: string;
  photo: string | null; startDate: string; finishDate: string;
  actualDuration: number; rating: string | null; createdAt: string;
}

interface OldState {
  products: OldProduct[];
  finishedProducts: OldFinished[];
  durationHistory: {
    byProduct: Record<string, number[]>;
    byCategory: Record<string, number[]>;
  };
}

export default function ImportPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login');
    });
  }, [router]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRunning(true);
    setError(null);

    try {
      const text = await file.text();
      const old: OldState = JSON.parse(text);

      if (!Array.isArray(old.products)) throw new Error('Invalid backup file');

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      setStatus(`Migrating ${old.products.length} active products…`);

      for (const p of old.products) {
        let photoUrl: string | null = null;
        if (p.photo?.startsWith('data:')) {
          setStatus(`Uploading photo for ${p.name}…`);
          photoUrl = await uploadBase64Photo(p.photo, user.id);
        }
        await insertProduct({
          name: p.name,
          category: p.category,
          routine: (p.routine as any) ?? 'Both',
          photo_url: photoUrl,
          start_date: p.startDate,
          created_at: p.createdAt,
          duration: p.duration,
          initial_remaining: p.initialRemaining,
          has_backup: p.hasBackup,
        });
      }

      setStatus(`Migrating ${old.finishedProducts?.length ?? 0} finished products…`);

      for (const p of (old.finishedProducts ?? [])) {
        let photoUrl: string | null = null;
        if (p.photo?.startsWith('data:')) {
          setStatus(`Uploading photo for ${p.name} (archive)…`);
          photoUrl = await uploadBase64Photo(p.photo, user.id);
        }
        await insertFinishedProduct({
          name: p.name, category: p.category,
          photo_url: photoUrl,
          start_date: p.startDate, finish_date: p.finishDate,
          actual_duration: p.actualDuration,
          rating: p.rating as any,
          created_at: p.createdAt,
        });
      }

      setStatus('Migrating duration history…');
      for (const [productName, durations] of Object.entries(old.durationHistory?.byProduct ?? {})) {
        const category = old.finishedProducts?.find(p => p.name === productName)?.category ?? 'Other';
        for (const duration of durations) {
          await insertDurationHistory(productName, category, duration);
        }
      }

      setStatus('Done! Redirecting to dashboard…');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surface)', borderRadius: '14px', padding: '32px', maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 12px rgba(61,43,31,0.08)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Import old backup</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Upload a <code>skinstack-backup-*.json</code> file exported from the old app. This will add all your products to your account. It won&apos;t delete anything already here.
        </p>

        {!running && !status && (
          <label style={{
            background: 'var(--accent1)', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '10px 16px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', textAlign: 'center',
          }}>
            Choose backup file
            <input type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        )}

        {status && <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{status}</p>}
        {error && <p style={{ fontSize: '14px', color: 'var(--red)' }}>Error: {error}</p>}
      </div>
    </div>
  );
}
