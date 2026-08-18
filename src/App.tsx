import React, { useState, useEffect } from 'react';
import { Swords, Flame, Trophy, Sparkles, ShieldCheck, RotateCcw, Award, CheckCircle2, ChevronRight, Zap, TrendingUp, Filter, Lock, LogOut, Sliders } from 'lucide-react';
import { Matchup } from './types';
import { INITIAL_MATCHUPS } from './data/initialMatchups';
import { ADMIN_SESSION_KEY } from './config/adminConfig';
import { Navbar } from './components/Navbar';
import { VersusCard } from './components/VersusCard';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';

const STORAGE_KEY = 'versus_arena_matchups_v1';

export default function App() {
  const [matchups, setMatchups] = useState<Matchup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved matchups', e);
    }
    return INITIAL_MATCHUPS;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'concluded'>('all');

  // Save matchups to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matchups));
    } catch (e) {
      console.error('Failed to save matchups', e);
    }
  }, [matchups]);

  // Handle Admin Login Success
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } catch (e) {
      console.error('Failed to save admin session', e);
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {
      console.error('Failed to remove admin session', e);
    }
  };

  // Handle single vote increment
  const handleVote = (matchupId: string, side: 'sideA' | 'sideB') => {
    setMatchups((prev) =>
      prev.map((m) => {
        if (m.id !== matchupId || m.status === 'expired') return m;

        return {
          ...m,
          userVotedSide: side,
          [side]: {
            ...m[side],
            votes: m[side].votes + 1,
          },
        };
      })
    );
  };

  // Handle matchup updates (timers, edits, etc)
  const handleUpdateMatchup = (updated: Matchup) => {
    setMatchups((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // Reset all to initial state
  const handleResetAll = () => {
    if (window.confirm('Reset all 5 matchups, votes, and timers back to factory defaults?')) {
      const reset = INITIAL_MATCHUPS.map((m) => ({
        ...m,
        timerEndsAt: m.timerDuration === '1m' ? Date.now() + 60 * 1000 : Date.now() + 2 * 24 * 60 * 60 * 1000,
        status: 'active' as const,
        userVotedSide: null,
      }));
      setMatchups(reset);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleJumpToMatch = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredMatchups = matchups.filter((m) => {
    if (activeFilter === 'active') return m.status === 'active';
    if (activeFilter === 'concluded') return m.status === 'expired';
    return true;
  });

  const totalVotesCast = matchups.reduce((sum, m) => sum + m.sideA.votes + m.sideB.votes, 0);
  const kingsCrowned = matchups.filter((m) => m.status === 'expired').length;

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Bento Navbar */}
      <Navbar
        matchups={matchups}
        isAdminAuthenticated={isAdminAuthenticated}
        isAdminOpen={isAdminOpen}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onToggleAdmin={() => setIsAdminOpen(!isAdminOpen)}
        onLogout={handleLogout}
        onResetAll={handleResetAll}
        onJumpToMatch={handleJumpToMatch}
      />

      {/* Admin Mode Floating Alert Bar (Only when Admin is Authenticated) */}
      {isAdminAuthenticated && (
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-blue-900/60 border-b border-purple-500/30 px-4 py-2 backdrop-blur-md sticky top-18 sm:top-20 z-30 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-purple-200">
              <span className="p-1 rounded bg-purple-500/30 text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white font-bold">ADMIN UNLOCKED:</strong> You have full creator control over all 5 sections, timers & votes.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" /> Control Panel
              </button>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded bg-black/40 hover:bg-red-950/60 text-gray-300 hover:text-red-300 border border-white/10 text-[11px] transition-all cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bento Grid Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
        {/* Top Bento Dashboard / Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Main Hero Card (2 cols on lg) */}
          <div className="glass-card rounded-2xl p-5 md:col-span-2 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                  Interactive Arena
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight font-syne">
                5 Epic Showdowns. <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Crown The King 👑
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-md">
                Vote across 5 comparisons with video reels, dynamic progress bars, and countdown timers that crown the victor.
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                ALL 5 ({matchups.length})
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeFilter === 'active'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                ACTIVE ({matchups.length - kingsCrowned})
              </button>
              <button
                onClick={() => setActiveFilter('concluded')}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeFilter === 'concluded'
                    ? 'bg-yellow-500 text-black font-black shadow-md shadow-yellow-500/30'
                    : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                CROWNED ({kingsCrowned})
              </button>
            </div>
          </div>

          {/* Metric Tile: Total Votes */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Total Ballots</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-mono font-black text-blue-400">
                {totalVotesCast.toLocaleString()}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Cast across all 5 duels</span>
            </div>
            <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>

          {/* Metric Tile: Kings Crowned */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Crowned Kings</span>
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="my-2">
              <div className="text-3xl sm:text-4xl font-mono font-black text-yellow-400">
                {kingsCrowned} / {matchups.length}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Battles concluded</span>
            </div>
            <div className="h-1 w-full bg-yellow-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${(kingsCrowned / matchups.length) * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* 5 Comparison Sections Arranged in Bento Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredMatchups.map((matchup, index) => (
            <div
              key={matchup.id}
              className={index === 0 && filteredMatchups.length % 2 !== 0 ? 'lg:col-span-2' : ''}
            >
              <VersusCard
                matchup={matchup}
                index={index}
                isAdmin={isAdminAuthenticated}
                onVote={handleVote}
                onUpdateMatchup={handleUpdateMatchup}
              />
            </div>
          ))}

          {filteredMatchups.length === 0 && (
            <div className="lg:col-span-2 p-12 text-center rounded-2xl glass-card border border-white/10">
              <p className="text-gray-400 text-xs font-mono">No battles match the current filter.</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-3 px-4 py-1.5 rounded-lg bg-purple-600 text-xs font-bold text-white font-mono"
              >
                SHOW ALL 5 SHOWDOWNS
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Admin Panel Modal (Only accessible when Authenticated) */}
      <AdminPanel
        isOpen={isAdminOpen && isAdminAuthenticated}
        matchups={matchups}
        onClose={() => setIsAdminOpen(false)}
        onUpdateMatchup={handleUpdateMatchup}
        onResetAll={handleResetAll}
        onLogout={handleLogout}
      />

      {/* Secret Password Authentication Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer in Bento style */}
      <footer className="mt-12 border-t border-white/10 bg-black/60 py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-white font-bold font-syne">
            <Swords className="w-3.5 h-3.5 text-blue-400" />
            <span>VERSUS ARENA • BENTO EDITION</span>
          </div>

          <div className="flex items-center gap-4">
            <p>© 2026 Versus Arena. All rights reserved.</p>
            {isAdminAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-[10px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" /> Admin Logout
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                title="Creator Secret Access"
              >
                <Lock className="w-2.5 h-2.5" /> Admin Access
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
