import type { Post, Stats } from '../types/entities';
import { storage } from '#imports';

export const viewedPostsStorage = storage.defineItem<Post[]>('local:viewedPosts', {
  fallback: [],
});

export const statsPostsStorage = storage.defineItem<Stats>('local:statsPosts', {
  fallback: {
    totalPosts: 0,
    totalVerifiedPosts: 0,
    totalMuskPosts: 0,
    totalInfodemicRiskIndex: 0,
    totalViews: 0,
    triggerWord: 'gaza', // default trigger word
    totalTriggeredWordPosts: 0,
  },
});
