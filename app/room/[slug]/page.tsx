'use client';

import { useState, useEffect, useRef, use, FormEvent, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { FiSend, FiMessageCircle, FiSmile, FiPlus } from 'react-icons/fi';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { nanoid } from 'nanoid';

type ReactionSummary = {
  emoji: string;
  count: number;
  reacted?: boolean;
  hashes?: string[];
};

const isReactionActive = (
  messageId: string,
  emoji: string,
  reaction: ReactionSummary,
  localMap: SetMap
) => {
  if (typeof reaction.reacted === 'boolean') {
    return reaction.reacted;
  }

  return localMap[messageId]?.has(emoji) ?? false;
};

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  tempId?: string;
  isOptimistic?: boolean;
  reactions: ReactionSummary[];
}

type SetMap = Record<string, Set<string>>;

const CLIENT_ID_STORAGE_KEY = 'blur-chat-client-id';
const REACTION_STORAGE_PREFIX = 'blur-chat-room-reactions:';
const QUICK_REACTIONS = ['👍', '😂', '❤️', '🔥', '🎉', '😮'];

const getReactionStorageKey = (slug: string) => `${REACTION_STORAGE_PREFIX}${slug}`;

const cloneSetMap = (map: SetMap): SetMap =>
  Object.fromEntries(Object.entries(map).map(([key, set]) => [key, new Set(set)]));

const mutateSetMap = (
  map: SetMap,
  messageId: string,
  emoji: string,
  shouldAdd: boolean
): SetMap => {
  const next = cloneSetMap(map);
  const current = new Set(next[messageId] ?? []);

  if (shouldAdd) {
    current.add(emoji);
  } else {
    current.delete(emoji);
  }

  if (current.size === 0) {
    delete next[messageId];
  } else {
    next[messageId] = current;
  }

  return next;
};

const serializeSetMap = (map: SetMap): Record<string, string[]> =>
  Object.fromEntries(Object.entries(map).map(([key, set]) => [key, Array.from(set)]));

const deserializeSetMap = (record: Record<string, string[]>): SetMap =>
  Object.fromEntries(Object.entries(record).map(([key, arr]) => [key, new Set(arr)]));

const buildSetMapFromMessages = (messageList: Message[]): SetMap => {
  const next: SetMap = {};

  messageList.forEach((message) => {
    const active = message.reactions
      .filter((reaction) => reaction.reacted)
      .map((reaction) => reaction.emoji);

    if (active.length > 0) {
      next[message.id] = new Set(active);
    }
  });

  return next;
};

const cloneMessages = (messageList: Message[]): Message[] =>
  messageList.map((message) => ({
    ...message,
    reactions: message.reactions.map((reaction) => ({
      ...reaction,
      hashes: reaction.hashes ? [...reaction.hashes] : undefined,
    })),
  }));

export default function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [roomName, setRoomName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientHash, setClientHash] = useState<string | null>(null);
  const [localReactions, setLocalReactions] = useState<SetMap>({});
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const clientIdRef = useRef<string | null>(null);
  const clientHashRef = useRef<string | null>(null);
  const localReactionsRef = useRef<SetMap>({});
  const hasLoadedReactionsRef = useRef(false);
  const pendingReactionsRef = useRef<Set<string>>(new Set());

  const getStorageKey = useCallback(
    () => getReactionStorageKey(resolvedParams.slug),
    [resolvedParams.slug]
  );

  const ensureClientIdentity = useCallback(() => {
    if (typeof window === 'undefined') return null;
    let stored = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);

    if (!stored) {
      stored =
        typeof window.crypto?.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : nanoid();
      window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, stored);
    }

    setClientId(stored);
    clientIdRef.current = stored;
    return stored;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    ensureClientIdentity();
  }, [ensureClientIdentity]);

  useEffect(() => {
    clientIdRef.current = clientId;
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;

    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      setClientHash(clientId);
      return;
    }

    let cancelled = false;

    const computeHash = async () => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(clientId);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        if (!cancelled) {
          setClientHash(hashHex);
        }
      } catch (error) {
        console.error('Failed to hash client id', error);
        if (!cancelled) {
          setClientHash(clientId);
        }
      }
    };

    void computeHash();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = getStorageKey();
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string[]>;
        const deserialized = deserializeSetMap(parsed);
        localReactionsRef.current = deserialized;
        setLocalReactions(deserialized);
      } else {
        localReactionsRef.current = {};
        setLocalReactions({});
      }
    } catch (error) {
      console.warn('Failed to read reaction cache', error);
      localReactionsRef.current = {};
      setLocalReactions({});
    } finally {
      hasLoadedReactionsRef.current = true;
    }
  }, [getStorageKey]);

  useEffect(() => {
    clientHashRef.current = clientHash;
  }, [clientHash]);

  useEffect(() => {
    localReactionsRef.current = localReactions;
    if (!hasLoadedReactionsRef.current) return;
    if (typeof window === 'undefined') return;

    const storageKey = getStorageKey();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(serializeSetMap(localReactions))
    );
  }, [localReactions, getStorageKey]);

  const mapServerMessage = useCallback((msg: any): Message => ({
    id: msg.id,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    tempId: msg.tempId,
    reactions: Array.isArray(msg.reactions)
      ? msg.reactions.map((reaction: any) => ({
          emoji: reaction.emoji,
          count: reaction.count,
          reacted: Boolean(reaction.reacted),
          hashes: reaction.hashes,
        }))
      : [],
  }), []);

  const applyServerReactionSnapshot = useCallback(
    (
      messageId: string,
      payload: Array<{ emoji: string; count: number; hashes?: string[]; reacted?: boolean }>
    ) => {
      const hashedId = clientHashRef.current;

      setMessages((prev) => {
        const next = prev.map((message) => {
          if (message.id !== messageId) return message;

          const nextReactions = payload.map((reaction) => {
            const isActive =
              typeof reaction.reacted === 'boolean'
                ? reaction.reacted
                : hashedId && reaction.hashes
                  ? reaction.hashes.includes(hashedId)
                  : localReactionsRef.current[messageId]?.has(reaction.emoji) ?? false;

            return {
              emoji: reaction.emoji,
              count: reaction.count,
              reacted: isActive,
              hashes: reaction.hashes,
            };
          });

          return {
            ...message,
            reactions: nextReactions,
          };
        });

        messagesRef.current = next;
        return next;
      });

      if (payload.length === 0) {
        const nextLocal = cloneSetMap(localReactionsRef.current);
        if (nextLocal[messageId]) {
          delete nextLocal[messageId];
          localReactionsRef.current = nextLocal;
          setLocalReactions(nextLocal);
        }
        return;
      }

      if (hashedId) {
        const nextLocal = cloneSetMap(localReactionsRef.current);
        delete nextLocal[messageId];

        payload.forEach((reaction) => {
          if (reaction.hashes?.includes(hashedId)) {
            if (!nextLocal[messageId]) {
              nextLocal[messageId] = new Set();
            }
            nextLocal[messageId]!.add(reaction.emoji);
          }
        });

        localReactionsRef.current = nextLocal;
        setLocalReactions(nextLocal);
        return;
      }

      if (payload.some((reaction) => typeof reaction.reacted === 'boolean')) {
        const nextLocal = cloneSetMap(localReactionsRef.current);
        delete nextLocal[messageId];

        payload.forEach((reaction) => {
          if (reaction.reacted) {
            if (!nextLocal[messageId]) {
              nextLocal[messageId] = new Set();
            }
            nextLocal[messageId]!.add(reaction.emoji);
          }
        });

        localReactionsRef.current = nextLocal;
        setLocalReactions(nextLocal);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [socket]);

  useEffect(() => {
    if (isVerified) {
      scrollToBottom();
    }
  }, [messages, isVerified]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVerifyPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch(`/api/rooms/${resolvedParams.slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Invalid password');
        setIsVerifying(false);
        return;
      }

      setRoomName(data.room.name);
      setIsVerified(true);
      const ensuredId = ensureClientIdentity();
      await initializeRoom(data.room.id, ensuredId);
    } catch (error) {
      toast.error('Something went wrong');
      setIsVerifying(false);
    }
  };

  const initializeRoom = async (roomId: string, providedClientId?: string | null) => {
    try {
      const activeClientId = providedClientId ?? clientIdRef.current ?? ensureClientIdentity();
      const headers: HeadersInit = activeClientId
        ? { 'x-client-id': activeClientId }
        : {};

      const messagesResponse = await fetch(`/api/rooms/${resolvedParams.slug}/messages`, {
        headers,
      });
      const messagesData = await messagesResponse.json();

      if (messagesResponse.ok) {
        const mappedMessages: Message[] = messagesData.messages.map(mapServerMessage);
        setMessages(mappedMessages);
        messagesRef.current = mappedMessages;
        const syncedReactions = buildSetMapFromMessages(mappedMessages);
        localReactionsRef.current = syncedReactions;
        setLocalReactions(syncedReactions);
      }

      const newSocket = io({
        path: '/socket.io',
        transports: ['websocket'],
      });

      let socketConnected = false;

      newSocket.on('connect', () => {
        socketConnected = true;
        stopPolling();
        console.log('Connected to socket server');
        newSocket.emit('join-room', resolvedParams.slug);
      });

      newSocket.on('new-message', (message: Message) => {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.tempId !== message.tempId);
          const mapped = mapServerMessage(message);
          const next = [...filtered, mapped];
          messagesRef.current = next;
          return next;
        });
      });

      newSocket.on(
        'message-reactions-updated',
        (payload: {
          messageId: string;
          reactions: Array<{ emoji: string; count: number; hashes?: string[] }>;
        }) => {
          applyServerReactionSnapshot(payload.messageId, payload.reactions);
        }
      );

      newSocket.on('connect_error', () => {
        if (!socketConnected) {
          startPolling();
        }
      });

      newSocket.on('disconnect', () => {
        startPolling();
      });

      newSocket.on('error', (error: { message: string }) => {
        toast.error(error.message);
      });

      setSocket(newSocket);
      setIsVerifying(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      toast.error('Failed to join room');
      setIsVerifying(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const tempId = nanoid();
    const optimisticMessage: Message = {
      id: tempId,
      content: newMessage,
      timestamp: new Date(),
      tempId,
      isOptimistic: true,
      reactions: [],
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    if (socket && socket.connected) {
      socket.emit('send-message', {
        roomSlug: resolvedParams.slug,
        content: newMessage,
        tempId,
      });
    } else {
      await sendMessageViaHttp(newMessage, tempId);
    }

    setNewMessage('');
    inputRef.current?.focus();
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    setIsPolling(true);
    void fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 4000);
  };

  const stopPolling = () => {
    if (!pollingRef.current) return;
    clearInterval(pollingRef.current);
    pollingRef.current = null;
    setIsPolling(false);
  };

  const fetchMessages = async () => {
    try {
      const activeClientId = clientIdRef.current ?? ensureClientIdentity();
      const headers: HeadersInit = activeClientId
        ? { 'x-client-id': activeClientId }
        : {};

      const response = await fetch(`/api/rooms/${resolvedParams.slug}/messages`, {
        headers,
      });
      if (!response.ok) return;

      const data = await response.json();
      const mapped = data.messages.map(mapServerMessage);
      setMessages(mapped);
      messagesRef.current = mapped;
      const syncedReactions = buildSetMapFromMessages(mapped);
      localReactionsRef.current = syncedReactions;
      setLocalReactions(syncedReactions);
    } catch (error) {
      console.error('Polling messages failed', error);
    }
  };

  const sendMessageViaHttp = async (content: string, tempId: string) => {
    try {
      const response = await fetch(`/api/rooms/${resolvedParams.slug}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tempId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const { message } = await response.json();
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.tempId !== message.tempId);
        const mapped = mapServerMessage(message);
        const next = [...filtered, mapped];
        messagesRef.current = next;
        return next;
      });
    } catch (error) {
      console.error('HTTP send message failed', error);
      toast.error('Message failed to send');
    }
  };

  const handleReactionToggle = async (messageId: string, emoji: string) => {
    const activeClientId = clientIdRef.current ?? ensureClientIdentity();

    if (!activeClientId) {
      toast.error('Unable to identify client');
      return;
    }

    const key = `${messageId}:${emoji}`;
    if (pendingReactionsRef.current.has(key)) {
      return;
    }

    const currentSet = localReactionsRef.current[messageId] ?? new Set<string>();
    const isAdding = !currentSet.has(emoji);
    const action: 'add' | 'remove' = isAdding ? 'add' : 'remove';

    const previousMessages = cloneMessages(messagesRef.current);
    const previousLocal = cloneSetMap(localReactionsRef.current);

    const mutatedLocal = mutateSetMap(localReactionsRef.current, messageId, emoji, isAdding);
    localReactionsRef.current = mutatedLocal;
    setLocalReactions(mutatedLocal);

    setMessages((prev) => {
      const next = prev.map((message) => {
        if (message.id !== messageId) return message;

        let found = false;
        const updatedReactions = message.reactions.map((reaction) => {
          if (reaction.emoji !== emoji) return reaction;
          found = true;
          const nextCount = isAdding
            ? reaction.count + 1
            : Math.max(reaction.count - 1, 0);
          return {
            ...reaction,
            count: nextCount,
            reacted: isAdding ? true : nextCount > 0 ? reaction.reacted : false,
          };
        });

        let nextReactions = updatedReactions;

        if (!found && isAdding) {
          nextReactions = [
            ...updatedReactions,
            {
              emoji,
              count: 1,
              reacted: true,
            },
          ];
        }

        if (!isAdding) {
          nextReactions = nextReactions.filter((reaction) => reaction.count > 0);
        }

        return {
          ...message,
          reactions: nextReactions,
        };
      });

      messagesRef.current = next;
      return next;
    });

    pendingReactionsRef.current.add(key);

    const payload = {
      roomSlug: resolvedParams.slug,
      messageId,
      emoji,
      action,
      clientId: activeClientId,
    };

    try {
      if (socket && socket.connected) {
        socket.emit('react-message', payload);
      } else {
        const response = await fetch(
          `/api/rooms/${resolvedParams.slug}/messages/${messageId}/reactions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': activeClientId,
            },
            body: JSON.stringify({ emoji, action }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update reactions');
        }

        const data = await response.json();
        applyServerReactionSnapshot(messageId, data.reactions);
      }
    } catch (error) {
      console.error('Reaction toggle failed', error);
      toast.error('Reaction failed');
      localReactionsRef.current = previousLocal;
      setLocalReactions(previousLocal);
      messagesRef.current = previousMessages;
      setMessages(previousMessages);
    } finally {
      pendingReactionsRef.current.delete(key);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] via-transparent to-transparent opacity-30" />
        
        <div className="relative w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center mx-auto mb-4">
              <FiMessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Enter Room</h1>
            <p className="text-[var(--text-secondary)]">
              This room is password protected
            </p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-8 shadow-[var(--shadow-lg)]">
            <form onSubmit={handleVerifyPassword} className="space-y-5">
              <Input
                label="Room Password"
                type="password"
                placeholder="Enter the room password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                Join Room
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
              <FiMessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{roomName}</h1>
              <p className="text-xs text-[var(--text-tertiary)]">Anonymous Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">Connected</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
              <p className="text-[var(--text-secondary)]">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`animate-fade-in ${message.isOptimistic ? 'opacity-60' : ''}`}
              >
                <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-4 max-w-2xl shadow-sm hover:shadow-[var(--shadow-md)] transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[var(--text-primary)] break-words whitespace-pre-wrap flex-1">
                      {message.content}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] whitespace-nowrap">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {message.reactions.map((reaction) => {
                      const active = isReactionActive(
                        message.id,
                        reaction.emoji,
                        reaction,
                        localReactions
                      );

                      return (
                        <button
                          key={reaction.emoji}
                          onClick={() => void handleReactionToggle(message.id, reaction.emoji)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)] ${
                            active
                              ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[0_0_0_1px_var(--accent-primary)]'
                              : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5'
                          }`}
                          aria-pressed={active}
                        >
                          <span className="text-base leading-none">{reaction.emoji}</span>
                          <span className="text-xs font-medium">{reaction.count}</span>
                        </button>
                      );
                    })}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveReactionPicker((prev) =>
                            prev === message.id ? null : message.id
                          )
                        }
                        className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]"
                        aria-label="Add reaction"
                      >
                        {activeReactionPicker === message.id ? (
                          <FiSmile className="w-4 h-4" />
                        ) : (
                          <FiPlus className="w-4 h-4" />
                        )}
                      </button>

                      {activeReactionPicker === message.id && (
                        <div className="absolute bottom-full left-0 mb-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-[var(--shadow-lg)] p-2 flex gap-1 animate-scale-in z-10">
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setActiveReactionPicker(null);
                                void handleReactionToggle(message.id, emoji);
                              }}
                              className="w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-[var(--accent-primary)]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                              aria-label={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] px-4 sm:px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-glow)] transition-all"
              maxLength={1000}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!newMessage.trim()}
              className="flex items-center gap-2 px-6"
            >
              <FiSend className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
