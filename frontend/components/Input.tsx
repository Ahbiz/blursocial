'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-[var(--bg-secondary)] text-[var(--text-primary)]
            border border-[var(--border-primary)]
            placeholder:text-[var(--text-tertiary)]
            focus:outline-none focus:border-[var(--accent-primary)]
            focus:shadow-[0_0_0_3px_var(--accent-glow)]
            transition-all duration-200
            ${error ? 'border-[var(--error)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[var(--error)] animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
