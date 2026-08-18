import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, Check, RefreshCw, Lock } from 'lucide-react';
import { TimerDurationKey } from '../types';
import { TIMER_OPTIONS } from '../data/initialMatchups';

interface TimerDropdownProps {
  timerDuration: TimerDurationKey;
  timerEndsAt: number | null;
  status: 'active' | 'expired';
  isAdmin?: boolean;
  onDurationChange: (key: TimerDurationKey) => void;
  onRestartTimer: (key?: TimerDurationKey) => void;
  onExpire: () => void;
}

export const TimerDropdown: React.FC<TimerDropdownProps> = ({
  timerDuration,
  timerEndsAt,
  status,
  isAdmin = false,
  onDurationChange,
  onRestartTimer,
  onExpire,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  useEffect(() => {
    if (!timerEndsAt || status === 'expired') {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
      return;
    }

    const calculateTime = () => {
      const now = Date.now();
      const diff = timerEndsAt - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [timerEndsAt, status, onExpire]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  const currentOption = TIMER_OPTIONS.find((opt) => opt.key === timerDuration) || TIMER_OPTIONS[1];

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      {/* Dropdown Selector for Admin / Read-only pill for Visitors */}
      {isAdmin ? (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 hover:bg-black/60 border border-purple-500/30 text-[10px] font-mono text-purple-300 transition-all cursor-pointer"
            title="Admin: Select Voting Countdown Duration"
          >
            <Clock className="w-3 h-3 text-purple-400" />
            <span>{currentOption.label.split(' ')[0]} {currentOption.label.split(' ')[1]}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 mt-1.5 z-50 w-56 rounded-xl bg-[#0b0b12] border border-white/15 shadow-2xl backdrop-blur-2xl p-1.5 animate-in fade-in zoom-in-95">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1 font-mono">
                  Duration Preset (Admin)
                </div>
                <div className="space-y-0.5">
                  {TIMER_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        onDurationChange(option.key);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all text-left cursor-pointer ${
                        timerDuration === option.key
                          ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{option.label}</span>
                      {timerDuration === option.key && <Check className="w-3 h-3 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400">
          <Clock className="w-2.5 h-2.5 text-blue-400" />
          <span>{currentOption.label}</span>
        </div>
      )}

      {/* Countdown Clock Display */}
      <div className="flex items-center gap-2">
        {status === 'active' ? (
          <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            {timeLeft.days > 0 && <span className="text-gray-400">{timeLeft.days}d </span>}
            <span className="text-blue-400 font-bold">
              {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
            </span>
            <span className="text-[9px] text-gray-500 uppercase tracking-tight ml-0.5 hidden sm:inline">LEFT</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 font-mono text-[10px] text-red-400 bg-red-950/40 border border-red-500/30 px-2.5 py-0.5 rounded-md">
            <Lock className="w-2.5 h-2.5" />
            <span>00:00:00 EXPIRED</span>
          </div>
        )}

        {isAdmin && (
          <button
            onClick={() => onRestartTimer(timerDuration)}
            className="p-1 rounded-md bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer"
            title={status === 'expired' ? 'Restart Timer' : 'Reset Timer'}
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};

