import React, { useState, useEffect } from 'react';
import { Swords, Flame, Trophy, Sparkles, ShieldAlert, RotateCcw, Award, CheckCircle2, ChevronRight, Zap, TrendingUp, Filter } from 'lucide-react';
import { Matchup } from './types';
import { INITIAL_MATCHUPS } from './data/initialMatchups';
import { Navbar } from './components/Navbar';
import { VersusCard } from './components/VersusCard';
import { AdminPanel } from './components/AdminPanel';

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

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'concluded'>('all');

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matchups));
    } catch (e) {
      console.error('Failed to save matchups', e);
    }
  }, [matchups]);

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
        isAdminOpen={isAdminOpen}
        onToggleAdmin={() => setIsAdminOpen(!isAdminOpen)}
        onResetAll={handleResetAll}
        onJumpToMatch={handleJumpToMatch}
      />

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

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        matchups={matchups}
        onClose={() => setIsAdminOpen(false)}
        onUpdateMatchup={handleUpdateMatchup}
        onResetAll={handleResetAll}
      />

      {/* Footer in Bento style */}
      <footer className="mt-12 border-t border-white/10 bg-black/60 py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-white font-bold font-syne">
            <Swords className="w-3.5 h-3.5 text-blue-400" />
            <span>VERSUS ARENA • BENTO EDITION</span>
          </div>
          <p>© 2026 Versus Arena. 5 Comparisons with auto-playing video reels, live gauges & KING celebrations.</p>
        </div>
      </footer>
    </div>
  );
}

