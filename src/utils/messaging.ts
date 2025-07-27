import { defineExtensionMessaging } from '@webext-core/messaging';
import type { Post } from '../types/entities';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ProtocolMap {
  POST_VIEWED: (post: Post) => void;
  RESET: () => void;
}

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
