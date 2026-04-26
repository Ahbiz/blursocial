'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    relative overflow-hidden font-medium rounded-xl
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
      text-white shadow-[var(--shadow-md)]
      hover:shadow-[var(--shadow-glow)] hover:scale-[1.02]
      before:absolute before:inset-0 before:bg-white before:opacity-0
      before:transition-opacity before:duration-200
      hover:before:opacity-10
    `,
    secondary: `
      bg-[var(--bg-elevated)] text-[var(--text-primary)]
      border border-[var(--border-primary)]
      hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent-primary)]
      hover:shadow-[var(--shadow-sm)]
    `,
    ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
