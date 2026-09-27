import { InputHTMLAttributes, forwardRef, useId } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', id, ...rest }, ref) => {
    const generatedId = useId();
    const finalId = id || generatedId;

    return (
      <input
        ref={ref}
        id={finalId}
        name={rest.name || finalId}
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${className}`}
        {...rest}
      />
    );
  }
);

Input.displayName = 'Input';