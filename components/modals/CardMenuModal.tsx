'use client';

import Modal from './Modal';

interface CardMenuModalProps {
  productName: string;
  onEdit: () => void;
  onFinish: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function CardMenuModal({ productName, onEdit, onFinish, onDelete, onClose }: CardMenuModalProps) {
  const btnStyle: React.CSSProperties = {
    background: 'var(--border)', color: 'var(--text)', border: 'none',
    borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left',
  };
  return (
    <Modal onClose={onClose} maxWidth={280}>
      <h2 style={{ fontSize: '16px', fontWeight: 700 }}>{productName}</h2>
      <button style={btnStyle} onClick={() => { onClose(); onEdit(); }}>✏️ Edit</button>
      <button style={btnStyle} onClick={() => { onClose(); onFinish(); }}>✅ Mark as finished</button>
      <button style={{ ...btnStyle, color: 'var(--red)' }} onClick={onDelete}>🗑 Delete</button>
      <button onClick={onClose}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
        Cancel
      </button>
    </Modal>
  );
}
