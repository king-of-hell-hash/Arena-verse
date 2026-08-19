import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, Edit3, ThumbsUp, Lock, RefreshCw, Zap, Video } from 'lucide-react';
import { Matchup, TimerDurationKey } from '../types';
import { MediaDisplay } from './MediaDisplay';
import { TimerDropdown } from './TimerDropdown';
import { MediaUploader } from './MediaUploader';
import { triggerKingCelebration, triggerVotePulse } from '../utils/confetti';
import { TIMER_OPTIONS } from '../data/initialMatchups';

interface VersusCardProps {
  matchup: Matchup;
  index: number;
  isAdmin?: boolean;
  onVote: (matchupId: string, side: 'sideA' | 'sideB') => void;
  onUpdateMatchup: (updated: Matchup) => void;
}

export const VersusCard: React.FC<VersusCardProps> = ({
  matchup,
  index,
  isAdmin = false,
  onVote,
  onUpdateMatchup,
}) => {
  const [isQuickEditing, setIsQuickEditing] = useState<boolean>(false);
  const [playRequestedSide, setPlayRequestedSide] = useState<'sideA' | 'sideB' | null>(null);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  const { sideA, sideB, timerDuration, timerEndsAt, status, userVotedSide } = matchup;

  const totalVotes = sideA.votes + sideB.votes;
  const sideAPercent = totalVotes === 0 ? 50 : Math.round((sideA.votes / totalVotes) * 100);
  const sideBPercent = totalVotes === 0 ? 50 : 100 - sideAPercent;

  const isExpired = status === 'expired';

  // Winner calculation when expired
  const isSideAWinner = isExpired && (sideA.votes > sideB.votes || (sideA.votes === sideB.votes && sideA.votes > 0));
  const isSideBWinner = isExpired && sideB.votes > sideA.votes;

  // Trigger celebration once when expired
  useEffect(() => {
    if (isExpired && !hasCelebrated) {
      triggerKingCelebration(`matchup-${matchup.id}`);
      setHasCelebrated(true);
    }
  }, [isExpired, hasCelebrated, matchup.id]);

  const handleVoteClick = (side: 'sideA' | 'sideB') => {
    if (isExpired) return;

    setPlayRequestedSide(side);
    triggerVotePulse();
    onVote(matchup.id, side);
  };

  const handleExpire = useCallback(() => {
    if (status !== 'expired') {
      const updated: Matchup = {
        ...matchup,
        status: 'expired',
      };
      onUpdateMatchup(updated);
      triggerKingCelebration();
    }
  }, [status, matchup, onUpdateMatchup]);

  const handleDurationChange = useCallback((key: TimerDurationKey) => {
    const opt = TIMER_OPTIONS.find((o) => o.key === key) || TIMER_OPTIONS[1];
    const updated: Matchup = {
      ...matchup,
      timerDuration: key,
      timerEndsAt: Date.now() + opt.durationMs,
      status: 'active',
    };
    setHasCelebrated(false);
    onUpdateMatchup(updated);
  }, [matchup, onUpdateMatchup]);

  const handleRestartTimer = useCallback((key?: TimerDurationKey) => {
    const targetKey = key || timerDuration;
    const opt = TIMER_OPTIONS.find((o) => o.key === targetKey) || TIMER_OPTIONS[1];
    const updated: Matchup = {
      ...matchup,
      timerDuration: targetKey,
      timerEndsAt: Date.now() + opt.durationMs,
      status: 'active',
    };
    setHasCelebrated(false);
    onUpdateMatchup(updated);
  }, [matchup, timerDuration, onUpdateMatchup]);

  // Color theme per duel index
  const categoryColors = [
    'text-purple-400',
    'text-blue-400',
    'text-emerald-400',
    'text-amber-400',
    'text-cyan-400',
  ];
  const catColor = categoryColors[index % categoryColors.length];

  return (
    <div
      id={matchup.id}
      className={`glass-card rounded-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden transition-all duration-300 scroll-mt-24 ${
        isExpired
          ? 'border-purple-500/50 neon-border-purple shadow-xl shadow-purple-500/10'
          : 'hover:border-white/20'
      }`}
    >
      {/* Card Header: Category & Timer Selector */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
            #{index + 1}
          </span>
          <span className={`text-[10px] font-bold ${catColor} uppercase tracking-widest truncate max-w-[180px] sm:max-w-none`}>
            {matchup.category}
          </span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickEditing(!isQuickEditing)}
              className="p-1 rounded-md hover:bg-white/10 text-purple-400 hover:text-white transition-all cursor-pointer"
              title="Admin Quick Edit card"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        )}
      </div>

      {/* Duel Title */}
      <div className="mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight text-white flex items-center justify-between">
          <span>{matchup.title}</span>
          {isExpired && (
            <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              👑 DECIDED
            </span>
          )}
        </h2>
      </div>

      {/* Quick Edit Inline Form (Only for Admin) */}
      {isAdmin && isQuickEditing && (
        <div className="mb-4 p-3 rounded-xl bg-black/70 border border-purple-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> Quick Edit Card #{index + 1}
            </span>
            <button
              onClick={() => setIsQuickEditing(false)}
              className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            {/* Side A Quick Edit */}
            <div className="space-y-1.5 p-2 rounded-lg bg-white/5 border border-blue-500/30">
              <span className="font-bold text-blue-400 uppercase">Side A</span>
              <input
                type="text"
                placeholder="Name"
                value={sideA.name}
                onChange={(e) =>
                  onUpdateMatchup({
                    ...matchup,
                    sideA: { ...sideA, name: e.target.value },
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[10px]"
              />
              <MediaUploader
                mediaType={sideA.mediaType}
                mediaUrl={sideA.mediaUrl}
                sideLabel={`Card #${index + 1} Side A`}
                accentColor="blue"
                onMediaChange={(newUrl, detectedType) => {
                  onUpdateMatchup({
                    ...matchup,
                    sideA: { ...sideA, mediaUrl: newUrl, mediaType: detectedType },
                  });
                }}
              />
            </div>

            {/* Side B Quick Edit */}
            <div className="space-y-1.5 p-2 rounded-lg bg-white/5 border border-purple-500/30">
              <span className="font-bold text-purple-400 uppercase">Side B</span>
              <input
                type="text"
                placeholder="Name"
                value={sideB.name}
                onChange={(e) =>
                  onUpdateMatchup({
                    ...matchup,
                    sideB: { ...sideB, name: e.target.value },
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-[10px]"
              />
              <MediaUploader
                mediaType={sideB.mediaType}
                mediaUrl={sideB.mediaUrl}
                sideLabel={`Card #${index + 1} Side B`}
                accentColor="purple"
                onMediaChange={(newUrl, detectedType) => {
                  onUpdateMatchup({
                    ...matchup,
                    sideB: { ...sideB, mediaUrl: newUrl, mediaType: detectedType },
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Side A vs Side B Layout */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-grow">
        {/* SIDE A ITEM */}
        <div
          className={`flex-1 flex flex-col justify-between rounded-xl p-2.5 transition-all ${
            userVotedSide === 'sideA'
              ? 'bg-blue-500/10 border border-blue-500/30 neon-border-blue'
              : 'bg-white/[0.02] border border-white/5 hover:border-blue-500/20'
          }`}
        >
          <div>
            <div className="mb-2">
              <MediaDisplay
                mediaType={sideA.mediaType}
                mediaUrl={sideA.mediaUrl}
                altText={sideA.name}
                side="sideA"
                isWinner={isSideAWinner}
                isPlayingRequested={playRequestedSide === 'sideA'}
              />
            </div>

            <h3 className="text-xs sm:text-sm font-bold truncate uppercase text-white">
              {sideA.name}
            </h3>
            <p className="text-[10px] text-gray-400 h-8 overflow-hidden leading-tight line-clamp-2 mt-0.5">
              {sideA.description}
            </p>
          </div>

          <button
            onClick={() => handleVoteClick('sideA')}
            disabled={isExpired}
            className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              isExpired
                ? isSideAWinner
                  ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/30 cursor-default'
                  : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                : userVotedSide === 'sideA'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {isExpired ? (
              isSideAWinner ? (
                <>
                  <Trophy className="w-3.5 h-3.5" />
                  <span>KING 👑 ({sideAPercent}%)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>LOCKED</span>
                </>
              )
            ) : (
              <>
                <ThumbsUp className="w-3 h-3" />
                <span>{userVotedSide === 'sideA' ? 'VOTED ✓' : `VOTE ${sideA.name.split(' ')[0]}`}</span>
              </>
            )}
          </button>
        </div>

        {/* Subtle Divider Line */}
        <div className="hidden sm:block w-px bg-white/10 self-stretch my-1" />

        {/* SIDE B ITEM */}
        <div
          className={`flex-1 flex flex-col justify-between rounded-xl p-2.5 transition-all ${
            userVotedSide === 'sideB'
              ? 'bg-purple-500/10 border border-purple-500/30 neon-border-purple'
              : 'bg-white/[0.02] border border-white/5 hover:border-purple-500/20'
          }`}
        >
          <div>
            <div className="mb-2">
              <MediaDisplay
                mediaType={sideB.mediaType}
                mediaUrl={sideB.mediaUrl}
                altText={sideB.name}
                side="sideB"
                isWinner={isSideBWinner}
                isPlayingRequested={playRequestedSide === 'sideB'}
              />
            </div>

            <h3 className="text-xs sm:text-sm font-bold truncate uppercase text-white">
              {sideB.name}
            </h3>
            <p className="text-[10px] text-gray-400 h-8 overflow-hidden leading-tight line-clamp-2 mt-0.5">
              {sideB.description}
            </p>
          </div>

          <button
            onClick={() => handleVoteClick('sideB')}
            disabled={isExpired}
            className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-black uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              isExpired
                ? isSideBWinner
                  ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/30 cursor-default'
                  : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                : userVotedSide === 'sideB'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-600/20 border border-purple-500/50 text-purple-400 hover:bg-purple-600 hover:text-white'
            }`}
          >
            {isExpired ? (
              isSideBWinner ? (
                <>
                  <Trophy className="w-3.5 h-3.5" />
                  <span>KING 👑 ({sideBPercent}%)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>LOCKED</span>
                </>
              )
            ) : (
              <>
                <ThumbsUp className="w-3 h-3" />
                <span>{userVotedSide === 'sideB' ? 'VOTED ✓' : `VOTE ${sideB.name.split(' ')[0]}`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Vote Percentages & Progress Bar */}
      <div className="mt-3 pt-2.5 border-t border-white/5">
        <div className="flex justify-between text-[10px] font-mono mb-1">
          <span className="text-blue-400 font-bold">
            {sideAPercent}% ({sideA.votes.toLocaleString()})
          </span>
          <span className="text-purple-400 font-bold">
            {sideBPercent}% ({sideB.votes.toLocaleString()})
          </span>
        </div>

        {/* Dual Bento Glowing Bar */}
        <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
          <div
            className="bg-blue-500 progress-bar-glow text-blue-500 transition-all duration-500"
            style={{ width: `${sideAPercent}%` }}
          />
          <div
            className="bg-purple-600 progress-bar-glow text-purple-600 transition-all duration-500"
            style={{ width: `${sideBPercent}%` }}
          />
        </div>

        {/* Timer Control Bar at Bottom */}
        <div className="mt-2">
          <TimerDropdown
            timerDuration={timerDuration}
            timerEndsAt={timerEndsAt}
            status={status}
            isAdmin={isAdmin}
            onDurationChange={handleDurationChange}
            onRestartTimer={handleRestartTimer}
            onExpire={handleExpire}
          />
        </div>
      </div>
    </div>
  );
};

