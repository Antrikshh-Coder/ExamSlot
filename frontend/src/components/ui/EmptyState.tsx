import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
        {icon || <FolderOpen className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="font-bold text-slate-900 text-lg tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 mb-6 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
