import type { Post } from '../types/entities';
import { storage } from '#imports';

export const viewedPostsStorage = storage.defineItem<Post['id'][]>('local:viewedPosts', {
  fallback: [],
});
