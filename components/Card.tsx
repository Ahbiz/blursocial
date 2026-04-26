import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-secondary)] rounded-2xl
        border border-[var(--border-primary)]
        shadow-[var(--shadow-sm)]
        transition-all duration-300
        ${hover ? 'hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-primary)] hover:scale-[1.01]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
