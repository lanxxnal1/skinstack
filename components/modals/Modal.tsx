'use client';

import { useEffect } from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ onClose, children, maxWidth = 420 }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(61,43,31,0.35)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: '14px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        width: '100%', maxWidth,
        maxHeight: '90vh', overflowY: 'auto',
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {children}
      </div>
    </div>
  );
}
