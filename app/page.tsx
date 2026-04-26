import Link from 'next/link';
import { FiMessageCircle, FiLock, FiUsers, FiZap } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <FiMessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">Blur</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg hover:shadow-[var(--shadow-glow)] transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-glow)] to-transparent opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Anonymous Chat
                <br />
                <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
                Create secure, password-protected chat rooms in seconds. Share the link, and chat anonymously with anyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl font-medium hover:shadow-[var(--shadow-glow)] hover:scale-105 transition-all"
                >
                  Create a Room
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl font-medium border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                  <FiLock className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-[var(--text-secondary)]">
                  Password-protected rooms ensure only invited participants can join your conversations.
                </p>
              </div>

              <div className="p-8 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                  <FiUsers className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fully Anonymous</h3>
                <p className="text-[var(--text-secondary)]">
                  No one knows who's speaking. Perfect for honest, judgment-free discussions.
                </p>
              </div>

              <div className="p-8 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                  <FiZap className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Messaging</h3>
                <p className="text-[var(--text-secondary)]">
                  Messages appear instantly for everyone in the room. No delays, no refresh needed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-primary)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[var(--text-tertiary)] text-sm">
          <p>© 2024 Blur. Anonymous chat made simple.</p>
        </div>
      </footer>
    </div>
  );
}
