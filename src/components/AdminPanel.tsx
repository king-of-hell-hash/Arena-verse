import React, { useState } from 'react';
import { ShieldCheck, X, Image, Video, RotateCcw, Check } from 'lucide-react';
import { Matchup, TimerDurationKey } from '../types';
import { TIMER_OPTIONS } from '../data/initialMatchups';

interface AdminPanelProps {
  isOpen: boolean;
  matchups: Matchup[];
  onClose: () => void;
  onUpdateMatchup: (updated: Matchup) => void;
  onResetAll: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  matchups,
  onClose,
  onUpdateMatchup,
  onResetAll,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matchups[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl glass-card border border-white/20 shadow-2xl overflow-hidden bg-[#08080f]/95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                Bento Arena Content Manager
                {saveSuccess && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> SAVED
                  </span>
                )}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matchup Selection Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-black/40 overflow-x-auto no-scrollbar">
          {matchups.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setSelectedMatchId(m.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer font-mono ${
                m.id === currentMatch?.id
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-md shadow-purple-600/20'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
              }`}
            >
              <span>#{idx + 1}</span>
              <span className="truncate max-w-[100px]">{m.title}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        {currentMatch && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* General Match Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
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
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
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
                  <span className="text-[10px] font-mono text-gray-400">
                    Votes: <strong className="text-blue-400">{currentMatch.sideA.votes}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Name / Title</label>
                  <input
                    type="text"
                    value={currentMatch.sideA.name}
                    onChange={(e) => handleSideChange('sideA', 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={currentMatch.sideA.description}
                    onChange={(e) => handleSideChange('sideA', 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[11px] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Media Type</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSideChange('sideA', 'mediaType', 'image')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        currentMatch.sideA.mediaType === 'image'
                          ? 'bg-blue-600 text-white'
                          : 'bg-black/50 text-gray-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      <Image className="w-3 h-3" /> Image
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSideChange('sideA', 'mediaType', 'video')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        currentMatch.sideA.mediaType === 'video'
                          ? 'bg-blue-600 text-white'
                          : 'bg-black/50 text-gray-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      <Video className="w-3 h-3" /> MP4 Video
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                    {currentMatch.sideA.mediaType === 'video' ? 'Direct Video URL (.mp4)' : 'Image URL'}
                  </label>
                  <input
                    type="url"
                    value={currentMatch.sideA.mediaUrl}
                    onChange={(e) => handleSideChange('sideA', 'mediaUrl', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[10px] text-white focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* SIDE B EDIT CARD */}
              <div className="p-4 rounded-xl bg-purple-500/[0.03] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                  <span className="px-2 py-0.5 rounded text-purple-300 text-[10px] font-mono font-extrabold uppercase bg-purple-600/20 border border-purple-500/40">
                    SIDE B CONFIG
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    Votes: <strong className="text-purple-400">{currentMatch.sideB.votes}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Name / Title</label>
                  <input
                    type="text"
                    value={currentMatch.sideB.name}
                    onChange={(e) => handleSideChange('sideB', 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={currentMatch.sideB.description}
                    onChange={(e) => handleSideChange('sideB', 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[11px] text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Media Type</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSideChange('sideB', 'mediaType', 'image')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        currentMatch.sideB.mediaType === 'image'
                          ? 'bg-purple-600 text-white'
                          : 'bg-black/50 text-gray-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      <Image className="w-3 h-3" /> Image
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSideChange('sideB', 'mediaType', 'video')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        currentMatch.sideB.mediaType === 'video'
                          ? 'bg-purple-600 text-white'
                          : 'bg-black/50 text-gray-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      <Video className="w-3 h-3" /> MP4 Video
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                    {currentMatch.sideB.mediaType === 'video' ? 'Direct Video URL (.mp4)' : 'Image URL'}
                  </label>
                  <input
                    type="url"
                    value={currentMatch.sideB.mediaUrl}
                    onChange={(e) => handleSideChange('sideB', 'mediaUrl', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[10px] text-white focus:outline-none focus:border-purple-500 font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions & Timers */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Trigger Timers & Reset
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleStartTimer('10s')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold transition-all cursor-pointer"
                >
                  10-Second Test
                </button>
                <button
                  onClick={() => handleStartTimer('1m')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold transition-all cursor-pointer"
                >
                  1-Minute Test
                </button>
                <button
                  onClick={() => handleStartTimer('1d')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[10px] font-bold transition-all cursor-pointer"
                >
                  1-Day Battle
                </button>
                <button
                  onClick={handleResetVotes}
                  className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-[10px] font-bold transition-all cursor-pointer font-mono"
                >
                  Reset Votes to 0
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
            <RotateCcw className="w-3 h-3" /> Reset Default 5 Duels
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

