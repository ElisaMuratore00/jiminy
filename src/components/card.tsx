import { cva } from 'class-variance-authority';

const cardVariants = cva('rounded-2xl border p-6 shadow-md', {
  variants: {
    variant: {
      primary: 'border-indigo-100 bg-white',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

type CardProps = {
  variant?: 'primary';
  className?: string;
  children?: React.ReactNode;
};

export function Card({ children, variant, className }: CardProps) {
  return <div className={cardVariants({ variant, className })}>{children}</div>;
}
