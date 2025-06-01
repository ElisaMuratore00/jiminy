import type { Post } from '../types/entities';
import logger from '../utils/logger';
import { sendMessage } from '../utils/messaging';
import { hashCode } from '../utils/utils';
import { defineContentScript } from '#imports';

const POST_SELECTOR = '[data-testid="tweet"]';

const observedPosts = new Set<string>();

export default defineContentScript({
  matches: ['*://*.x.com/*'],
  main: async ctx => {
    logger.info('Content started');

    const intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          observer.unobserve(target);

          const id = getPostId(target);
          if (observedPosts.has(id)) return;
          observedPosts.add(id);

          const text = target.querySelector('[data-testid="tweetText"]')?.textContent ?? '';
          const username =
            target.querySelector('[data-testid="User-Name"] a[role="link"] span')?.textContent ??
            '';
          const datetime =
            target
              .querySelector('[data-testid="User-Name"] a[role="link"] time')
              ?.getAttribute('datetime') ?? '';

          const timestamp = new Date(datetime).getTime();

          const post: Post = {
            id: id,
            text,
            username,
            createdAt: timestamp,
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

      logger.debug('New post detected:', { postId });
      intersectionObserver.observe(post);
    }

    document.querySelectorAll(POST_SELECTOR).forEach(post => {
      processNewPost(post);
    });

    ctx.onInvalidated(() => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();

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
