import { Mutex } from 'async-mutex';
import type { Post, Stats } from '../../types/entities';
import logger from '../../utils/logger';
import { statsPostsStorage, viewedPostsStorage } from '../../utils/storage';
import { isMuskPost, urlReliability } from '../../utils/utils';

const saveViewedPostMutex = new Mutex();
const updateStatsMutex = new Mutex();

/**
 * Save viewed post if new
 * @param data Post
 */
export const saveNewViewedPost = (data: Post) =>
  saveViewedPostMutex.runExclusive(async () => {
    const viewedPosts = await viewedPostsStorage.getValue();
    const index = viewedPosts.findIndex(post => post.id === data.id);
    if (index !== -1) return;
    logger.info('New post viewed', data);

    await viewedPostsStorage.setValue([...viewedPosts, data]);

    updateStats(data);
  });

/**
 * Update stats after post viewed
 * @param data Post
 */
export const updateStats = (data: Post) =>
  updateStatsMutex.runExclusive(async () => {
    const originalStats = await statsPostsStorage.getValue();

    const stats: Stats = { ...originalStats };

    // update `total` posts counter
    stats.totalPosts += 1;

    // update `verified` property mean
    if (data.verified) stats.verifiedPosts += 1;

    // update `IRI` using URL realiability and views count
    if (data.urls && data.urls.length > 0) {
      let ignoredUrls = 0;
      const reliability = data.urls.reduce((acc, current) => {
        const r = urlReliability(current);
        if (r === undefined) {
          ignoredUrls += 1;
          return acc;
        }
        return acc + r;
      }, 0);

      if (ignoredUrls !== data.urls.length) {
        const views = data.views ?? 0;
        const reliabilityAverage = reliability / (data.urls.length - ignoredUrls);

        const numerator = stats.infodemicRiskIndex * stats.totalViews + reliabilityAverage * views;

        // update `views`
        stats.totalViews += views;
        // update `IRI`
        stats.infodemicRiskIndex = numerator / stats.totalViews;
      }
    }

    // update `Musk` posts counter
    if (isMuskPost(data.username)) stats.muskPosts += 1;

    await statsPostsStorage.setValue(stats);
  });
