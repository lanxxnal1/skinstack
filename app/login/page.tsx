'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
    router.refresh();
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px', background: 'var(--bg)',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '14px',
        padding: '32px', width: '100%', maxWidth: '380px',
        boxShadow: '0 2px 12px rgba(61,43,31,0.08)',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>
          Skin<span style={{ color: 'var(--accent1)' }}>Stack</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '-12px' }}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </p>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', width: '100%' }}
            />
          </div>
          {error && <p style={{ fontSize: '13px', color: 'var(--red)' }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{
              background: 'var(--accent1)', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px', fontSize: '14px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Loading…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => handleOAuth('google')}
            style={{
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              borderRadius: '8px', padding: '10px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('apple')}
            style={{
              background: '#000', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Continue with Apple
          </button>
        </div>

        <button
          onClick={() => setIsSignUp(v => !v)}
          style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
