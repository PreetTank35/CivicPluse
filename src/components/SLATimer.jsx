import { useEffect, useState } from 'react';

/**
 * Circular SLA countdown timer
 * Shows remaining time with color transitions (green → amber → red)
 */
export default function SLATimer({ deadline, size = 80 }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    function update() {
      if (!deadline) return;
      const now = Date.now();
      const end = new Date(deadline).getTime();
      const diff = end - now;
      setTimeLeft(diff);
    }
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deadline]);

  if (timeLeft === null) return null;

  const isBreached = timeLeft < 0;
  const absTime = Math.abs(timeLeft);
  const hours = Math.floor(absTime / 3600000);
  const days = Math.floor(hours / 24);

  let displayValue, displayLabel;
  if (days > 0) {
    displayValue = days;
    displayLabel = days === 1 ? 'day' : 'days';
  } else {
    displayValue = hours;
    displayLabel = hours === 1 ? 'hour' : 'hours';
  }

  // Progress for circle (0 = just started, 1 = deadline reached)
  // We'll assume a 7-day max window for visualization
  const maxMs = 7 * 24 * 3600000;
  let progress;
  if (isBreached) {
    progress = 1;
  } else {
    progress = Math.max(0, 1 - timeLeft / maxMs);
  }

  // Color based on progress
  let color;
  if (isBreached) color = '#ef4444';
  else if (progress > 0.75) color = '#f59e0b';
  else color = '#10b981';

  // SVG circle math
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="sla-timer" style={{ width: size, height: size }}>
      <svg className="sla-timer-circle" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="sla-timer-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="sla-timer-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="sla-timer-text">
        <div className="sla-timer-value" style={{ color }}>
          {isBreached ? '-' : ''}{displayValue}
        </div>
        <div className="sla-timer-label">
          {isBreached ? 'overdue' : displayLabel}
        </div>
      </div>
    </div>
  );
}
