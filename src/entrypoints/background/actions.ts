import { Mutex } from 'async-mutex';
import type { NewTriggerWord, Post, Stats, TriggerCounts } from '../../types/entities';
import logger from '../../utils/logger';
import { statsPostsStorage, viewedPostsStorage } from '../../utils/storage';
import { containsTriggerWordInPostType, isMuskPost, urlReliability } from '../../utils/utils';
import { browser } from '#imports';

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
    if (data.verified) stats.totalVerifiedPosts += 1;

    // update `IRI` using URL reliability and views count
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
        const views = data.views ?? data.likes ?? 0;
        const reliabilityAverage = reliability / (data.urls.length - ignoredUrls);

        const numerator =
          stats.totalInfodemicRiskIndex * stats.totalViews + (1 - reliabilityAverage) * views;

        // update `views`
        stats.totalViews += views;
        // update `IRI`
        stats.totalInfodemicRiskIndex = numerator / stats.totalViews;
        // update reliable/unreliable counters
        if (reliabilityAverage < 1.0) {
          stats.totalUnreliablePosts += 1;
        } else {
          stats.totalReliablePosts += 1;
        }
      }
    }

    // update `Musk` posts counter
    if (isMuskPost(data.username)) stats.totalMuskPosts += 1;

    // update `trigger word` posts counter
    for (const triggerWord of Object.keys(originalStats.triggerWordCounters)) {
      if (containsTriggerWordInPostType(data, triggerWord)) {
        stats.triggerWordCounters[triggerWord] = originalStats.triggerWordCounters[triggerWord] + 1;
      }
    }

    await statsPostsStorage.setValue(stats);
  });

/**
 * Download data as JSON file
 */
export const downloadData = async () => {
  // Get viewed posts and convert to JSON
  const viewedPosts = await viewedPostsStorage.getValue();

  const json = JSON.stringify(viewedPosts);
  browser.downloads
    .download({
      url: 'data:application/json;charset=utf-8,' + encodeURIComponent(json),
      filename: 'viewed-posts.json',
      conflictAction: 'uniquify',
    })
    .then(() => {
      logger.info('Data download initiated');
    })
    .catch(error => {
      logger.error('Error downloading data', { error });
    });
};

export const updateTriggerWordCounter = (data: NewTriggerWord) =>
  updateStatsMutex.runExclusive(async () => {
    const stats = await statsPostsStorage.getValue();
    const viewedPosts = await viewedPostsStorage.getValue();

    // Set new trigger word in statsPostsStorage
    const newTriggerWord = data.newTriggerWord.trim().toLowerCase();
    const newTriggerWordCount = viewedPosts.filter(post =>
      containsTriggerWordInPostType(post, newTriggerWord),
    ).length;

    // Update stats
    stats.triggerWordCounters[newTriggerWord] = newTriggerWordCount;
    await statsPostsStorage.setValue(stats);
  });

export const setTriggerWordCounterToValue = async (newTriggerCounts: TriggerCounts) =>
  updateStatsMutex.runExclusive(async () => {
    const originalStats = await statsPostsStorage.getValue();

    const stats: Stats = {
      ...originalStats,
      triggerWordCounters: newTriggerCounts,
    };

    await statsPostsStorage.setValue(stats);
  });
