import React from 'react';
import { Swords, ShieldAlert, RotateCcw, Flame, Trophy, Sparkles } from 'lucide-react';
import { Matchup } from '../types';

interface NavbarProps {
  matchups: Matchup[];
  isAdminOpen: boolean;
  onToggleAdmin: () => void;
  onResetAll: () => void;
  onJumpToMatch: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  matchups,
  isAdminOpen,
  onToggleAdmin,
  onResetAll,
  onJumpToMatch,
}) => {
  const totalVotes = matchups.reduce(
    (sum, m) => sum + m.sideA.votes + m.sideB.votes,
    0
  );

  const expiredCount = matchups.filter((m) => m.status === 'expired').length;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#050508]/85 border-b border-white/10 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300">
              <span className="font-black text-xl italic text-white font-syne">V</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight uppercase text-white font-syne">
                VERSUS <span className="text-purple-400 font-light underline underline-offset-4 decoration-1">ARENA</span>
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                High-Stakes Community Voting
              </p>
            </div>
          </div>

          {/* Center Stats Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="glass-card px-3.5 py-1.5 rounded-full flex items-center gap-2.5 border-blue-500/30">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-mono text-blue-400 uppercase tracking-tighter">
                Total: <strong className="text-white font-bold">{totalVotes.toLocaleString()}</strong>
              </span>
            </div>

            <div className="glass-card px-3.5 py-1.5 rounded-full flex items-center gap-2.5 border-purple-500/30">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-mono text-purple-300 uppercase tracking-tighter">
                Kings: <strong className="text-yellow-400 font-bold">{expiredCount} / {matchups.length}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <div
              id="admin-toggle-btn"
              onClick={onToggleAdmin}
              className={`px-4 py-2 rounded-full cursor-pointer transition-all border flex items-center gap-2 shadow-sm ${
                isAdminOpen
                  ? 'bg-purple-600 border-purple-400 text-white shadow-purple-500/30'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
              title="Toggle Config Panel"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {isAdminOpen ? 'Close Config' : 'Config Panel'}
              </span>
            </div>

            <button
              id="reset-all-btn"
              onClick={onResetAll}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Reset all votes & timers to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Quick Jump Pill Bar */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-white/5 text-xs">
          <span className="text-gray-400 shrink-0 text-[10px] font-mono uppercase tracking-widest px-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span> DUELS:
          </span>
          {matchups.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => onJumpToMatch(m.id)}
              className="shrink-0 px-3 py-1 rounded-full glass-card hover:bg-white/10 text-[11px] font-medium text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer border border-white/5"
            >
              <span className="text-blue-400 font-mono font-bold">#{idx + 1}</span>
              <span className="truncate max-w-[120px]">{m.sideA.name.split(' ')[0]} vs {m.sideB.name.split(' ')[0]}</span>
              {m.status === 'expired' && <span className="text-yellow-400 text-[10px]">👑</span>}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

