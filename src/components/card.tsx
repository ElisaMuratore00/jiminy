import { cva } from 'class-variance-authority';

const cardVariants = cva('rounded-2xl border p-6 shadow-md', {
  variants: {
    variant: {
      primary: 'border-indigo-100 bg-white',
      secondary: 'border-gray-100 bg-indigo-100',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

type CardProps = {
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
};

export function Card({ children, variant, className }: CardProps) {
  return <div className={cardVariants({ variant, className })}>{children}</div>;
}
