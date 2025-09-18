import { cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'preact/compat';

const buttonVariants = cva('flex-1 rounded-lg px-4 py-2 font-medium shadow transition-colors', {
  variants: {
    variant: {
      primary: 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-md',
      secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export const Button = ({
  variant,
  className,
  children,
  ...props
}: ButtonHTMLAttributes & { variant?: 'primary' | 'secondary' }) => (
  <button className={buttonVariants({ variant, className })} {...props}>
    {children}
  </button>
);

// Input component with same styles as Button
export const Input = ({
  variant,
  className,
  ...props
}: InputHTMLAttributes & { variant?: 'primary' | 'secondary' }) => (
  <input
    className={buttonVariants({ variant, className }) + ' text-center placeholder:text-center'}
    {...props}
  />
);
