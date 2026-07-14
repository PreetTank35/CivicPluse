import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { STATUS_ORDER } from '../data/mockData';

const STATUS_META = {
  reported: { label: 'Reported', color: '#ef4444', icon: '📢' },
  verified: { label: 'Verified', color: '#f59e0b', icon: '✅' },
  escalated: { label: 'Escalated', color: '#3b82f6', icon: '📤' },
  in_progress: { label: 'In Progress', color: '#6366f1', icon: '🔧' },
  resolved: { label: 'Resolved', color: '#10b981', icon: '🎉' },
};

/**
 * StatusStepper — visual timeline showing problem lifecycle.
 * Reported → Verified → Escalated → In Progress → Resolved
 */
export default function StatusStepper({ currentStatus, statusHistory = [], compact = false }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {STATUS_ORDER.map((status, idx) => {
          const meta = STATUS_META[status];
          const isReached = idx <= currentIndex;
          const isCurrent = status === currentStatus;
          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: isCurrent ? '10px' : '6px',
                  height: isCurrent ? '10px' : '6px',
                  borderRadius: '50%',
                  background: isReached ? meta.color : 'var(--border)',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? `0 0 0 3px ${meta.color}33` : 'none',
                }}
                title={meta.label}
              />
              {idx < STATUS_ORDER.length - 1 && (
                <div style={{
                  width: '16px',
                  height: '2px',
                  background: idx < currentIndex ? meta.color : 'var(--border)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="status-stepper">
      {STATUS_ORDER.map((status, idx) => {
        const meta = STATUS_META[status];
        const isReached = idx <= currentIndex;
        const isCurrent = status === currentStatus;
        const historyEntry = statusHistory.find(h => h.new_status === status);

        return (
          <div key={status} className="status-step" style={{ display: 'flex', gap: '12px', marginBottom: idx < STATUS_ORDER.length - 1 ? '0' : '0' }}>
            {/* Vertical line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '28px' }}>
              <div
                style={{
                  width: isCurrent ? '28px' : '22px',
                  height: isCurrent ? '28px' : '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isReached ? meta.color : 'var(--bg-tertiary)',
                  color: isReached ? '#fff' : 'var(--text-muted)',
                  border: isCurrent ? `3px solid ${meta.color}44` : isReached ? 'none' : '2px solid var(--border)',
                  transition: 'all 0.3s ease',
                  fontSize: '11px',
                  flexShrink: 0,
                }}
              >
                {isReached ? <CheckCircle size={isCurrent ? 14 : 12} /> : <Circle size={10} />}
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div style={{
                  width: '2px',
                  height: '32px',
                  background: idx < currentIndex ? meta.color : 'var(--border)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: idx < STATUS_ORDER.length - 1 ? '12px' : '0' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: isCurrent ? 700 : 500,
                color: isReached ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                {isCurrent && (
                  <span style={{
                    fontSize: '10px',
                    background: `${meta.color}18`,
                    color: meta.color,
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontWeight: 700,
                  }}>
                    Current
                  </span>
                )}
              </div>
              {historyEntry && (
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                }}>
                  {new Date(historyEntry.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                  {historyEntry.note && ` — ${historyEntry.note}`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
