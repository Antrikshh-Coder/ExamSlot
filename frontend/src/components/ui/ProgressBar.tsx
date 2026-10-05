import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  sublabel?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  sublabel,
  color = 'blue',
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const barColors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-600',
    cyan: 'bg-cyan-500',
  }[color];

  const sizeHeight = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full space-y-1.5">
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && <span className="text-slate-700">{label}</span>}
          {sublabel && <span className="text-slate-500">{sublabel}</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeHeight}`}>
        <div
          className={`${barColors} ${sizeHeight} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
