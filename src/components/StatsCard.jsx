import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ value, label, icon: Icon, trend, trendLabel, variant = 'primary' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);

  // Count-up animation
  useEffect(() => {
    const numVal = typeof value === 'number' ? value : parseInt(value) || 0;
    if (numVal === 0) { setDisplayValue(value); return; }

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numVal);
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value]);

  const formatValue = (v) => {
    if (typeof value === 'string' && value.includes('%')) return `${v}%`;
    if (typeof value === 'string' && value.includes('h')) return `${v}h`;
    return v;
  };

  return (
    <div className={`stats-card stat-${variant}`}>
      {Icon && (
        <div className={`stats-card-icon icon-${variant}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="stats-card-value">{formatValue(displayValue)}</div>
      <div className="stats-card-label">{label}</div>
      {trend !== undefined && (
        <div className={`stats-card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}% {trendLabel || 'vs last month'}
        </div>
      )}
    </div>
  );
}
