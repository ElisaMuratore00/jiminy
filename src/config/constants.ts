export const POST_VIEWED_DELAY = import.meta.env.DEV ? 200 : 500; // ms

export const POST_SELECTOR = '[data-testid="tweet"]';
export const MUSK_USERNAME = 'elonmusk';

export const TRIGGER_WORDS_DEFAULT = {} as const satisfies Record<string, number>;
