import { Mutex } from 'async-mutex';
import type { Post, Stats } from '../../types/entities';
import logger from '../../utils/logger';
import { sendMessage } from '../../utils/messaging';
import { statsPostsStorage, viewedPostsStorage } from '../../utils/storage';
import { isMuskPost, urlReliability } from '../../utils/utils';
import { browser } from '#imports';

const saveViewedPostMutex = new Mutex();
const updateStatsMutex = new Mutex();

/**
 * Download data as JSON file
 */
export const downloadData = async () => {
  // Get viewed posts and convert to JSON
  const viewedPosts = await viewedPostsStorage.getValue();
  const viewedPostsJSON = JSON.stringify(viewedPosts, null, 2);
  logger.info(`Preparing download of ${viewedPosts.length} viewed posts`);

  // Send message to content script to trigger download
  logger.info('Sending viewedPostsJSON to content script for download');
  const tabId = (await browser.tabs.query({ active: true, currentWindow: true }))[0]?.id;
  if (tabId === undefined) {
    logger.error('No active tab found to send the blob for download');
    return;
  }
  sendMessage('DOWNLOAD_BLOB', { viewedPostsJSON }, { tabId });
  logger.info('viewedPostsJSON sent to content script');
};

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
    if (data.verified) stats.totalVerifiedPosts += 1;

    // update `IRI` using URL realiability and views count
    if (data.urls.length > 0) {
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

        const numerator =
          stats.totalInfodemicRiskIndex * stats.totalViews + reliabilityAverage * views;

        // update `views`
        stats.totalViews += views;
        // update `IRI`
        stats.totalInfodemicRiskIndex = numerator / stats.totalViews;
      }
    }

    // update `Musk` posts counter
    if (isMuskPost(data.username)) stats.totalMuskPosts += 1;

    await statsPostsStorage.setValue(stats);
  });
