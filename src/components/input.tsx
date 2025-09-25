import { cva } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'preact/compat';

const inputVariants = cva('flex-1 rounded-lg px-4 py-2 font-medium shadow transition-colors', {
  variants: {
    variant: {
      primary: 'bg-indigo-500 text-white',
      secondary: 'bg-gray-200 text-gray-700',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

// Input component with same styles as Button
export const Input = ({
  variant,
  className,
  ...props
}: InputHTMLAttributes & { variant?: 'primary' | 'secondary' }) => (
  <input
    className={inputVariants({ variant, className }) + ' text-center placeholder:text-center'}
    {...props}
  />
);
