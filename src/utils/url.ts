import { Mutex } from 'async-mutex';
import logger from './logger';
import { unshortenedUrlStorage } from './storage';
import { type Browser, browser } from '#imports';

const updateUnshortenUrlMutex = new Mutex();

export const unshortenUrl = async (url: string): Promise<string> => {
  const cache = await unshortenedUrlStorage.getValue();

  // Check cache
  if (cache[url]) return cache[url];

  try {
    // Create a hidden tab to track redirects
    const tab = await browser.tabs.create({
      url: url,
      active: false,
      index: 0,
    });

    const finalUrl = await new Promise<string>(resolve => {
      const listener = async (tabId: number, changeInfo: Browser.tabs.TabChangeInfo) => {
        if (tabId !== tab.id || changeInfo.status !== 'complete') return;
        clearTimeout(timeout);

        const tabInfo = await browser.tabs.get(tabId);

        const finalUrl = tabInfo.url ?? url;

        // Update cache
        updateUnshortenUrlMutex.runExclusive(async () => {
          const cache = await unshortenedUrlStorage.getValue();
          cache[url] = finalUrl;
          await unshortenedUrlStorage.setValue(cache);
        });

        browser.tabs.remove(tabId);
        resolve(finalUrl);
      };

      // Set a timeout to handle cases where the URL doesn't redirect
      const timeout = setTimeout(() => {
        if (tab.id !== undefined) browser.tabs.remove(tab.id);
        browser.tabs.onUpdated.removeListener(listener);
        resolve(url);
      }, 10_000);

      browser.tabs.onUpdated.addListener(listener);
    });

    return finalUrl;
  } catch (error) {
    logger.error('Unshorten error:', { error });
    return url; // Fallback to original URL
  }
};
