/**
 * SkeletonCard — shimmer skeleton loaders for feed and lists
 */

export function SkeletonFeedCard() {
  return (
    <div className="skeleton-card" style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-xl, 16px)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      maxWidth: '600px',
      margin: '0 auto var(--space-md, 16px)',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="skeleton-shimmer" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-shimmer" style={{ width: '120px', height: '12px', borderRadius: '6px', marginBottom: '6px' }} />
          <div className="skeleton-shimmer" style={{ width: '80px', height: '10px', borderRadius: '6px' }} />
        </div>
        <div className="skeleton-shimmer" style={{ width: '50px', height: '10px', borderRadius: '6px' }} />
      </div>

      {/* Image */}
      <div className="skeleton-shimmer" style={{ width: '100%', height: '280px' }} />

      {/* Actions */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: '16px' }}>
        <div className="skeleton-shimmer" style={{ width: '70px', height: '28px', borderRadius: '14px' }} />
        <div className="skeleton-shimmer" style={{ width: '50px', height: '28px', borderRadius: '14px' }} />
        <div style={{ flex: 1 }} />
        <div className="skeleton-shimmer" style={{ width: '40px', height: '28px', borderRadius: '14px' }} />
      </div>

      {/* Text */}
      <div style={{ padding: '4px 16px 16px' }}>
        <div className="skeleton-shimmer" style={{ width: '85%', height: '14px', borderRadius: '6px', marginBottom: '8px' }} />
        <div className="skeleton-shimmer" style={{ width: '60%', height: '12px', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderBottom: '1px solid var(--border-light, #f0f0f0)',
    }}>
      <div className="skeleton-shimmer" style={{ width: '60px', height: '20px', borderRadius: '10px' }} />
      <div className="skeleton-shimmer" style={{ width: '200px', height: '14px', borderRadius: '6px' }} />
      <div style={{ flex: 1 }} />
      <div className="skeleton-shimmer" style={{ width: '80px', height: '14px', borderRadius: '6px' }} />
      <div className="skeleton-shimmer" style={{ width: '60px', height: '24px', borderRadius: '6px' }} />
    </div>
  );
}

export function SkeletonList({ count = 5, type = 'feed' }) {
  const Component = type === 'feed' ? SkeletonFeedCard : SkeletonTableRow;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}

export default SkeletonFeedCard;
