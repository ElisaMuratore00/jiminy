import { POST_SELECTOR } from '../config/constants';
import type { Media, Post } from '../types/entities';
import logger from '../utils/logger';
import { onMessage, sendMessage } from '../utils/messaging';
import { hashCode, parseCount } from '../utils/utils';
import { defineContentScript } from '#imports';

export default defineContentScript({
  matches: ['*://*.x.com/*'],
  main: async ctx => {
    logger.info('Content started');

    const observedPosts = new Set<string>();

    const intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          observer.unobserve(target);

          const id = getPostId(target);
          if (observedPosts.has(id)) return;
          observedPosts.add(id);

          const text = target.querySelector('[data-testid="tweetText"]')?.textContent?.trim() ?? '';
          const username =
            target
              .querySelector('[data-testid="User-Name"] a[role="link"]')
              ?.getAttribute('href')
              ?.trim()
              .replace(/^\//, '') ?? '';
          const datetime =
            target
              .querySelector('[data-testid="User-Name"] a[role="link"] time')
              ?.getAttribute('datetime') ?? '';
          const createdAt = new Date(datetime).getTime();

          const verified = target.querySelector('[data-testid="icon-verified"]') !== null;
          const likes = parseCount(
            target.querySelector('[data-testid="like"]')?.textContent?.trim() ?? '',
          );
          const comments = parseCount(
            target.querySelector('[data-testid="reply"]')?.textContent?.trim() ?? '',
          );
          const reposts = parseCount(
            target.querySelector('[data-testid="retweet"]')?.textContent?.trim() ?? '',
          );
          const views = parseCount(
            target.querySelector('a[href$="/analytics"]')?.textContent?.trim() ?? '',
          );

          const images = Array.from(
            target.querySelectorAll('[data-testid="tweetPhoto"] img[src]'),
          ).map(
            element =>
              ({
                type: 'image',
                url: element.getAttribute('src') ?? undefined,
                description: element.getAttribute('alt') ?? undefined,
              }) satisfies Media,
          );
          const videos = Array.from(
            target.querySelectorAll('[data-testid="tweetPhoto"] video'),
          ).map(
            () =>
              ({
                type: 'video',
              }) satisfies Media,
          );

          const urls = Array.from(text.matchAll(/https?:\/\/[^\s]+/g)).map(([url]) => url);
          const mentions = Array.from(text.matchAll(/@[^\s]+/g)).map(([mention]) => mention);
          const hashtags = Array.from(text.matchAll(/#[^\s]+/g)).map(([hashtag]) => hashtag);

          const post: Post = {
            id,
            username,
            text,
            verified,
            likes,
            comments,
            reposts,
            views,
            media: [...images, ...videos],
            urls,
            mentions,
            hashtags,
            createdAt,
          };
          logger.debug('New post visible:', post);
          sendMessage('POST_VIEWED', post);
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.3,
      },
    );
    const mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              if (element.matches(POST_SELECTOR)) {
                processNewPost(element);
              }

              const posts = element.querySelectorAll(POST_SELECTOR);
              posts.forEach(post => processNewPost(post));
            }
          });
        }
      }
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    function processNewPost(post: Element) {
      const postId = getPostId(post);

      // Click "Show more" to show all post text
      post
        .querySelector('button[data-testid="tweet-text-show-more-link"')
        //@ts-expect-error this can exist
        ?.click?.();

      logger.debug('New post detected:', { postId });
      intersectionObserver.observe(post);
    }

    function main() {
      // Get posts already in the DOM
      document.querySelectorAll(POST_SELECTOR).forEach(post => {
        processNewPost(post);
      });
    }

    const unregisterReset = onMessage('RESET', () => {
      logger.info('Content reset');
      observedPosts.clear();

      main();
    });

    // Invalidate
    ctx.onInvalidated(() => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
      unregisterReset();

      logger.debug('Content invalidated');
    });
  },
});

function getPostId(post: Element): string {
  const href = post.querySelector('a[href*="/status/"]')?.getAttribute('href');
  if (href) return href;

  // Fallback to data attributes or text content hash
  const dataTestId = post.getAttribute('data-testid');
  if (dataTestId) {
    const textContent = post.textContent?.slice(0, 100) ?? '';
    return `${dataTestId}-${hashCode(textContent)}`;
  }

  // Fallback to bounding rect
  const rect = post.getBoundingClientRect();
  const textContent = post.textContent?.slice(0, 50) ?? '';
  return `fallback-${rect.top}-${hashCode(textContent)}`;
}
