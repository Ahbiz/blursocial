'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiMessageCircle, FiPlus, FiCopy, FiLogOut, FiExternalLink } from 'react-icons/fi';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';

interface Room {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchRooms();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();

      if (response.ok) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, password: roomPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create room');
        return;
      }

      toast.success('Room created successfully!');
      setRooms([data.room, ...rooms]);
      setShowCreateModal(false);
      setRoomName('');
      setRoomPassword('');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const copyRoomLink = (slug: string) => {
    const link = `${window.location.origin}/room/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <FiMessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">Blur</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--text-secondary)]">
                {user?.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Chat Rooms</h1>
            <p className="text-[var(--text-secondary)]">
              Create and manage your anonymous chat rooms
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <FiPlus className="w-5 h-5" />
            Create Room
          </Button>
        </div>

        {rooms.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No rooms yet</h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Create your first chat room to get started
              </p>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <FiPlus className="w-5 h-5" />
                Create Your First Room
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} hover className="p-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-2 truncate">{room.name}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Created {new Date(room.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyRoomLink(room.slug)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <FiCopy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Link href={`/room/${room.slug}`} className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      Open
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-8 max-w-md w-full shadow-[var(--shadow-lg)] animate-scale-in">
            <h2 className="text-2xl font-bold mb-6">Create New Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-5">
              <Input
                label="Room Name"
                type="text"
                placeholder="e.g., Team Discussion"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                minLength={3}
                maxLength={50}
              />
              <Input
                label="Room Password"
                type="password"
                placeholder="Set a password for the room"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                required
                minLength={4}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isCreating}
                  className="flex-1"
                >
                  Create Room
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
