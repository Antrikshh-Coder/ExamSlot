import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  badge?: {
    text: string;
    type?: 'success' | 'warning' | 'neutral' | 'info';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  badge,
  onClick,
}) => {
  const badgeStyle = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  }[badge?.type || 'info'];

  return (
    <Card hoverEffect={!!onClick} onClick={onClick} className="p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </span>
        </div>
        <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 border border-slate-100 shadow-xs`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100/80">
        {subtitle && <span className="text-xs text-slate-500 font-medium truncate">{subtitle}</span>}
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle} ml-auto`}>
            {badge.text}
          </span>
        )}
      </div>
    </Card>
  );
};
