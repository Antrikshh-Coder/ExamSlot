import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Info } from 'lucide-react';

export type StatusVariant = 
  | 'success' | 'pass' | 'approved' | 'clash-free' | 'configured' | 'published'
  | 'warning' | 'pending' | 'in-progress'
  | 'danger' | 'fail' | 'rejected' | 'conflict'
  | 'neutral' | 'info';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  showIcon = true,
  size = 'md',
}) => {
  // Infer variant from status string if not explicitly passed
  const normalized = (variant || status).toLowerCase().replace(/\s+/g, '-');

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Info;

  if (['success', 'pass', 'approved', 'clash-free', 'configured', 'published', 'active'].includes(normalized)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold';
    IconComponent = CheckCircle2;
  } else if (['warning', 'pending', 'in-progress', 'scheduled', 'review'].includes(normalized)) {
    style = 'bg-amber-50 text-amber-800 border-amber-200/80 font-semibold';
    IconComponent = Clock;
  } else if (['danger', 'fail', 'rejected', 'conflict', 'clash'].includes(normalized)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold';
    IconComponent = XCircle;
  } else if (['info', 'academic', 'system'].includes(normalized)) {
    style = 'bg-blue-50 text-blue-700 border-blue-200/80 font-semibold';
    IconComponent = ShieldCheck;
  }

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-md border ${style} ${sizeClass} tracking-tight select-none`}>
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span className="uppercase">{status}</span>
    </span>
  );
};
