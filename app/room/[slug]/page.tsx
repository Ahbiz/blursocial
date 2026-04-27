'use client';

import { useState, useEffect, useRef, use, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { nanoid } from 'nanoid';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  tempId?: string;
  isOptimistic?: boolean;
}

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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      await initializeRoom(data.room.id);
    } catch (error) {
      toast.error('Something went wrong');
      setIsVerifying(false);
    }
  };

  const initializeRoom = async (roomId: string) => {
    try {
      const messagesResponse = await fetch(`/api/rooms/${resolvedParams.slug}/messages`);
      const messagesData = await messagesResponse.json();

      if (messagesResponse.ok) {
        setMessages(messagesData.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
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
          return [...filtered, { ...message, timestamp: new Date(message.timestamp) }];
        });
      });

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
      const response = await fetch(`/api/rooms/${resolvedParams.slug}/messages`);
      if (!response.ok) return;

      const data = await response.json();
      setMessages(
        data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
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
        return [...filtered, { ...message, timestamp: new Date(message.timestamp) }];
      });
    } catch (error) {
      console.error('HTTP send message failed', error);
      toast.error('Message failed to send');
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
                <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-4 max-w-2xl">
                  <p className="text-[var(--text-primary)] break-words whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
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
