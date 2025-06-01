import logger from '../utils/logger';
import { onMessage } from '../utils/messaging';
import { viewedPostsStorage } from '../utils/storage';
import { browser, defineBackground } from '#imports';

export default defineBackground(() => {
  logger.info('Background started', { id: browser.runtime.id });

  onMessage('POST_VIEWED', async ({ data }) => {
    const viewedPosts = await viewedPostsStorage.getValue();
    const index = viewedPosts.indexOf(data.id);
    if (index !== -1) return;
    logger.info('New post viewed', data);

    viewedPosts.push(data.id);
    viewedPostsStorage.setValue(viewedPosts);
  });
});
