import type { Post, Stats } from '../types/entities';
import { storage } from '#imports';

export const viewedPostsStorage = storage.defineItem<Post[]>('local:viewedPosts', {
  fallback: [],
});

export const statsPostsStorage = storage.defineItem<Stats>('local:statsPosts', {
  fallback: {
    totalPosts: 0,
    verifiedPosts: 0,
    muskPosts: 0,
    infodemicRiskIndex: 0,
    totalViews: 0,
  },
});
