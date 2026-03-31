'use client';

export default function DashboardPage() {
  return (
    <div>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>
          Skin<span style={{ color: 'var(--accent1)' }}>Stack</span>
        </h1>
        <button style={{
          background: 'var(--accent1)', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        }}>
          + Add product
        </button>
      </header>
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading…</p>
      </main>
    </div>
  );
}
