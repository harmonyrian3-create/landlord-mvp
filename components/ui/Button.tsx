import { ButtonHTMLAttributes, forwardRef } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, loading, variant = 'primary', className = '', disabled, ...rest }, ref) => {
    const base =
      'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800',
      secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${className}`}
        {...rest}
      >
        {loading ? 'Please wait…' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';