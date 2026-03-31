import Modal from './Modal';
import type { FinishedProduct } from '@/types';

const RATING_LABEL: Record<string, string> = {
  loved: '😍 Loved it',
  ok: '😐 It was ok',
  'wont-repurchase': "👎 Won't repurchase",
};

interface ArchiveDetailModalProps {
  product: FinishedProduct;
  onClose: () => void;
}

export default function ArchiveDetailModal({ product, onClose }: ArchiveDetailModalProps) {
  return (
    <Modal onClose={onClose}>
      {product.photo_url && (
        <img src={product.photo_url} alt={product.name}
          style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '220px' }} />
      )}
      <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{product.name}</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-10px' }}>{product.category}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Opened</span>
          <span>{product.start_date}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Finished</span>
          <span>{product.finish_date}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Lasted</span>
          <span>{product.actual_duration} days</span>
        </div>
        {product.rating && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rating</span>
            <span>{RATING_LABEL[product.rating]}</span>
          </div>
        )}
      </div>

      <button onClick={onClose}
        style={{ background: 'var(--border)', color: 'var(--text)', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
        Close
      </button>
    </Modal>
  );
}
