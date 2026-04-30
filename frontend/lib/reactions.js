const { createHash } = require('crypto');

const VALID_EMOJI_REGEX = /\p{Extended_Pictographic}/u;

function normalizeEmoji(emoji) {
  if (!emoji || typeof emoji !== 'string') return null;
  const trimmed = emoji.trim();
  return VALID_EMOJI_REGEX.test(trimmed) ? trimmed : null;
}

function hashClientId(clientId) {
  return createHash('sha256').update(clientId || '').digest('hex');
}

function summarizeReactions(reactions, clientHash) {
  return Object.entries(reactions).map(([emoji, users]) => ({
    emoji,
    count: users.length,
    reacted: clientHash ? users.includes(clientHash) : false,
  }));
}

function summarizeReactionsWithHashes(reactions) {
  return Object.entries(reactions).map(([emoji, users]) => ({
    emoji,
    count: users.length,
    hashes: users,
  }));
}

function applyReaction(reactions, emoji, clientHash, action) {
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

module.exports = {
  hashClientId,
  normalizeEmoji,
  summarizeReactionsWithHashes,
  applyReaction,
  summarizeReactions,
  VALID_EMOJI_REGEX
};