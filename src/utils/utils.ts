import { type ClassNameValue, twMerge } from 'tailwind-merge';
import reliabilityList from '../assets/reliability-list.json';
import { MUSK_USERNAME } from '../config/constants';
import type { Post } from '../types/entities';
import { TRIGGER_WORD } from '../config/constants';

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

export const parseCount = (str: string): number | undefined => {
  if (!str) return;
  const parsed = str.toLowerCase();
  const number = Number(parsed.replace(/[a-z]/g, ''));
  if (isNaN(number)) return;

  if (parsed.includes('k')) return number * 1_000;
  if (parsed.includes('m')) return number * 1_000_000;
  return number;
};

export const isMuskPost = (username: Post['username']): boolean =>
  username.toLowerCase().trim().replace(/^@/, '') === MUSK_USERNAME;

export const urlReliability = (url: string): number | undefined => {
  const hostname = new URL(url).hostname;
  return reliabilityList[hostname as keyof typeof reliabilityList];
};

export const postContainsTriggerWord = (post: Post['text']): boolean => {
  const content = post.toLowerCase();
  const triggerWord = TRIGGER_WORD.toLowerCase();
  return content.includes(triggerWord);
}
