import { KernelContent } from '../../contents';
import { Encoding } from '../../contents/textContent';
import { AuthorRole } from './authorRole';
import { ChatMessageContentItemCollection } from './chatMessageContentItemCollection';

export type ChatMessageContent = KernelContent & {
  authorName?: string;
  authorRole: AuthorRole;
  items: ChatMessageContentItemCollection;
  encoding: Encoding;
  source?: object;
};
