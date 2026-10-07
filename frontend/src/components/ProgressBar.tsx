import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 8,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="progress-container" style={{ height }}>
      <div
        className="progress-fill"
        style={{
          width: `${clamped}%`,
          backgroundColor: color || undefined,
        }}
      />
    </div>
  );
};
