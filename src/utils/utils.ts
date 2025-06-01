import { type ClassNameValue, twMerge } from 'tailwind-merge';

export const cn = (...classLists: ClassNameValue[]) => twMerge(classLists);

export const hashCode = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};
