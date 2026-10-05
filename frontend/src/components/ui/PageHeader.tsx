import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  icon,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
      <div className="space-y-1">
        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="hover:text-blue-600 font-medium transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-slate-800' : ''}>
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title and Subtitle */}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
