import React, { useState } from 'react';
import { ShieldCheck, X, Image, Video, RotateCcw, Check, LogOut, Sliders, Clock, Trophy, RefreshCw } from 'lucide-react';
import { Matchup, TimerDurationKey, MediaType } from '../types';
import { TIMER_OPTIONS } from '../data/initialMatchups';
import { MediaUploader } from './MediaUploader';

interface AdminPanelProps {
  isOpen: boolean;
  matchups: Matchup[];
  onClose: () => void;
  onUpdateMatchup: (updated: Matchup) => void;
  onResetAll: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  matchups,
  onClose,
  onUpdateMatchup,
  onResetAll,
  onLogout,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matchups[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<string>('5');

  if (!isOpen) return null;

  const currentMatch = matchups.find((m) => m.id === selectedMatchId) || matchups[0];

  const handleFieldChange = (field: string, value: any) => {
    if (!currentMatch) return;
    const updated = { ...currentMatch, [field]: value };
    onUpdateMatchup(updated);
    showSavedNotification();
  };

  const handleSideChange = (side: 'sideA' | 'sideB', field: string, value: any) => {
    if (!currentMatch) return;
    const updated = {
      ...currentMatch,
      [side]: {
        ...currentMatch[side],
        [field]: value,
      },
    };
    onUpdateMatchup(updated);
    showSavedNotification();
  };

  const handleVoteOverride = (side: 'sideA' | 'sideB', newVoteCount: number) => {
    if (!currentMatch) return;
    const count = Math.max(0, isNaN(newVoteCount) ? 0 : newVoteCount);
    const updated = {
      ...currentMatch,
      [side]: {
        ...currentMatch[side],
        votes: count,
      },
    };
    onUpdateMatchup(updated);
    showSavedNotification();
  };

  const showSavedNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetVotes = () => {
    if (!currentMatch) return;
    const updated: Matchup = {
      ...currentMatch,
      sideA: { ...currentMatch.sideA, votes: 0 },
      sideB: { ...currentMatch.sideB, votes: 0 },
      userVotedSide: null,
    };
    onUpdateMatchup(updated);
    showSavedNotification();
  };

  const handleStartTimer = (durationKey: TimerDurationKey) => {
    if (!currentMatch) return;
    const opt = TIMER_OPTIONS.find((o) => o.key === durationKey) || TIMER_OPTIONS[1];
    const updated: Matchup = {
      ...currentMatch,
      timerDuration: durationKey,
      timerEndsAt: Date.now() + opt.durationMs,
      status: 'active',
    };
    onUpdateMatchup(updated);
    showSavedNotification();
  };

  const handleStartCustomTimer = () => {
    if (!currentMatch) return;
    const mins = Math.max(1, parseInt(customMinutes, 10) || 5);
    const updated: Matchup = {
      ...currentMatch,
      timerDuration: '1m', // base reference
      timerEndsAt: Date.now() + mins * 60 * 1000,
      status: 'active',
    };
    onUpdateMatchup(updated);
    showSavedNotification();
  };

  const handleForceExpire = () => {
    if (!currentMatch) return;
    const updated: Matchup = {
      ...currentMatch,
      status: 'expired',
    };
    onUpdateMatchup(updated);
    showSavedNotification();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl glass-card border border-purple-500/30 shadow-2xl overflow-hidden bg-[#08080f]/95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide font-syne">
                Admin Control Center
                {saveSuccess && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> SAVED
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">
                Authenticated Session • Full override active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[11px] font-mono font-bold transition-all cursor-pointer"
              title="Lock Admin Mode & Exit"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Matchup Selection Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-black/40 overflow-x-auto no-scrollbar">
          {matchups.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setSelectedMatchId(m.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer font-mono ${
                m.id === currentMatch?.id
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-500/60 shadow-md shadow-purple-600/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
              }`}
            >
              <span>#{idx + 1}</span>
              <span className="truncate max-w-[110px]">{m.title}</span>
              {m.status === 'expired' && <span className="text-yellow-400 text-[10px]">👑</span>}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        {currentMatch && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* General Match Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider font-mono">
                  Duel Title
                </label>
                <input
                  type="text"
                  value={currentMatch.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="e.g. The GOAT Debate"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider font-mono">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={currentMatch.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  placeholder="e.g. Sports & Legends"
                />
              </div>
            </div>

            {/* Side A & Side B Comparison Edit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SIDE A EDIT CARD */}
              <div className="p-4 rounded-xl bg-blue-500/[0.03] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="px-2 py-0.5 rounded text-blue-300 text-[10px] font-mono font-extrabold uppercase bg-blue-600/20 border border-blue-500/40">
                    SIDE A CONFIG
                  </span>
                  {/* Manual Vote Adjustment */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-400">Votes:</span>
                    <input
                      type="number"
                      min="0"
                      value={currentMatch.sideA.votes}
                      onChange={(e) => handleVoteOverride('sideA', parseInt(e.target.value, 10))}
                      className="w-16 px-1.5 py-0.5 bg-black/60 border border-blue-500/50 rounded text-center text-xs font-mono font-bold text-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 font-mono">Name / Title</label>
                  <input
                    type="text"
                    value={currentMatch.sideA.name}
                    onChange={(e) => handleSideChange('sideA', 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 font-mono">Description</label>
                  <textarea
                    rows={2}
                    value={currentMatch.sideA.description}
                    onChange={(e) => handleSideChange('sideA', 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[11px] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Media Upload from Gallery / Device */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 font-mono">
                    Side A Photo / Video
                  </label>
                  <MediaUploader
                    mediaType={currentMatch.sideA.mediaType}
                    mediaUrl={currentMatch.sideA.mediaUrl}
                    sideLabel="Side A"
                    accentColor="blue"
                    onMediaChange={(newUrl, detectedType) => {
                      if (!currentMatch) return;
                      const updated = {
                        ...currentMatch,
                        sideA: {
                          ...currentMatch.sideA,
                          mediaUrl: newUrl,
                          mediaType: detectedType,
                        },
                      };
                      onUpdateMatchup(updated);
                      showSavedNotification();
                    }}
                  />
                </div>
              </div>

              {/* SIDE B EDIT CARD */}
              <div className="p-4 rounded-xl bg-purple-500/[0.03] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="px-2 py-0.5 rounded text-purple-300 text-[10px] font-mono font-extrabold uppercase bg-purple-600/20 border border-purple-500/40">
                    SIDE B CONFIG
                  </span>
                  {/* Manual Vote Adjustment */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-400">Votes:</span>
                    <input
                      type="number"
                      min="0"
                      value={currentMatch.sideB.votes}
                      onChange={(e) => handleVoteOverride('sideB', parseInt(e.target.value, 10))}
                      className="w-16 px-1.5 py-0.5 bg-black/60 border border-purple-500/50 rounded text-center text-xs font-mono font-bold text-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 font-mono">Name / Title</label>
                  <input
                    type="text"
                    value={currentMatch.sideB.name}
                    onChange={(e) => handleSideChange('sideB', 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 font-mono">Description</label>
                  <textarea
                    rows={2}
                    value={currentMatch.sideB.description}
                    onChange={(e) => handleSideChange('sideB', 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[11px] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Media Upload from Gallery / Device */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 font-mono">
                    Side B Photo / Video
                  </label>
                  <MediaUploader
                    mediaType={currentMatch.sideB.mediaType}
                    mediaUrl={currentMatch.sideB.mediaUrl}
                    sideLabel="Side B"
                    accentColor="purple"
                    onMediaChange={(newUrl, detectedType) => {
                      if (!currentMatch) return;
                      const updated = {
                        ...currentMatch,
                        sideB: {
                          ...currentMatch.sideB,
                          mediaUrl: newUrl,
                          mediaType: detectedType,
                        },
                      };
                      onUpdateMatchup(updated);
                      showSavedNotification();
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Timer & Battle Overrides */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3 h-3 text-purple-400" />
                  Timer Controls & Status Override
                </h3>
                <span className="text-[10px] font-mono text-gray-400">
                  Status:{' '}
                  <strong className={currentMatch.status === 'expired' ? 'text-yellow-400' : 'text-emerald-400'}>
                    {currentMatch.status === 'expired' ? 'CROWNED 👑' : 'ACTIVE VOTING'}
                  </strong>
                </span>
              </div>

              {/* Timer Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleStartTimer('10s')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  10 Sec
                </button>
                <button
                  onClick={() => handleStartTimer('1m')}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  1 Min
                </button>
                <button
                  onClick={() => handleStartTimer('1d')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  1 Day
                </button>
                <button
                  onClick={() => handleStartTimer('2d')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  2 Days
                </button>
                <button
                  onClick={() => handleStartTimer('4d')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  4 Days
                </button>
                <button
                  onClick={() => handleStartTimer('6d')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  6 Days
                </button>

                {/* Custom Minutes */}
                <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-lg p-1">
                  <input
                    type="number"
                    min="1"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-12 bg-transparent text-center text-xs font-mono text-white focus:outline-none"
                    placeholder="Min"
                  />
                  <button
                    onClick={handleStartCustomTimer}
                    className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-[10px] font-mono font-bold text-white cursor-pointer"
                  >
                    Set Mins
                  </button>
                </div>

                {/* Force End / Crown Winner */}
                <button
                  onClick={handleForceExpire}
                  className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trophy className="w-3 h-3 text-yellow-400" /> Crown Winner Now
                </button>

                {/* Reset Votes to 0 */}
                <button
                  onClick={handleResetVotes}
                  className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-[10px] font-bold transition-all cursor-pointer font-mono ml-auto"
                >
                  Reset Match Votes to 0
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[11px] font-semibold transition-all cursor-pointer font-mono"
          >
            <RotateCcw className="w-3 h-3" /> Reset All 5 Duels to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Exit & Logout
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer uppercase tracking-wider"
            >
              Done Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


