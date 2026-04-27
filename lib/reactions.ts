import { createHash } from 'crypto';

export const VALID_EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export function normalizeEmoji(emoji: string): string | null {
  if (!emoji || typeof emoji !== 'string') return null;
  const trimmed = emoji.trim();
  return VALID_EMOJI_REGEX.test(trimmed) ? trimmed : null;
}

export function hashClientId(clientId: string): string {
  return createHash('sha256').update(clientId).digest('hex');
}

export function summarizeReactions(
  reactions: Record<string, string[]>,
  clientHash?: string
) {
  return Object.entries(reactions).map(([emoji, users]) => ({
    emoji,
    count: users.length,
    reacted: clientHash ? users.includes(clientHash) : false,
  }));
}

export function summarizeReactionsWithHashes(
  reactions: Record<string, string[]>
) {
  return Object.entries(reactions).map(([emoji, users]) => ({
    emoji,
    count: users.length,
    hashes: users,
  }));
}

export function applyReaction(
  reactions: Record<string, string[]>,
  emoji: string,
  clientHash: string,
  action: 'add' | 'remove'
) {
  const currentUsers = new Set(reactions[emoji] ?? []);

  if (action === 'add') {
    currentUsers.add(clientHash);
  } else {
    currentUsers.delete(clientHash);
  }

  if (currentUsers.size === 0) {
    delete reactions[emoji];
  } else {
    reactions[emoji] = Array.from(currentUsers);
  }

  return reactions;
}
