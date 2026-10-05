import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white border ${
              error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            } rounded-lg ${icon ? 'pl-9' : 'px-3.5'} py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-3 disabled:bg-slate-50 disabled:opacity-60 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
