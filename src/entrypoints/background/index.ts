import logger from '../../utils/logger';
import { onMessage, sendMessage } from '../../utils/messaging';
import { statsPostsStorage, viewedPostsStorage } from '../../utils/storage';
import { saveNewViewedPost } from './actions';
import { browser, defineBackground } from '#imports';

export default defineBackground(() => {
  logger.info('Background started', { id: browser.runtime.id });

  onMessage('POST_VIEWED', async ({ data }) => {
    await saveNewViewedPost(data);
  });

  onMessage('RESET', async () => {
    await viewedPostsStorage.removeValue({ removeMeta: true });
    await statsPostsStorage.removeValue({ removeMeta: true });

    browser.tabs.query({}).then(tabs => {
      // Send reset message to all tabs
      for (const tab of tabs)
        if (tab.id !== undefined) sendMessage('RESET', undefined, { tabId: tab.id });
    });
  });
});
