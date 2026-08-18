import React, { useRef, useEffect, useState } from 'react';
import { Crown, Play, Pause, Volume2, VolumeX, Sparkles, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { MediaType } from '../types';

interface MediaDisplayProps {
  mediaType: MediaType;
  mediaUrl: string;
  altText: string;
  side: 'sideA' | 'sideB';
  isWinner: boolean;
  isPlayingRequested: boolean;
  onMediaError?: () => void;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({
  mediaType,
  mediaUrl,
  altText,
  side,
  isWinner,
  isPlayingRequested,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Auto-play video smoothly as soon as user votes or requests play
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      if (isPlayingRequested) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              setIsPlaying(false);
            });
        }
      }
    }
  }, [isPlayingRequested, mediaType]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const isSideA = side === 'sideA';
  const accentBorder = isSideA ? 'border-blue-500/30' : 'border-purple-500/30';
  const badgeColor = isSideA ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' : 'bg-purple-600/20 text-purple-300 border-purple-500/40';

  return (
    <div
      className={`relative w-full aspect-video sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden glass-card transition-all duration-500 ${
        isWinner
          ? 'border-yellow-400 neon-border-gold ring-2 ring-yellow-400/50 scale-[1.01]'
          : `${accentBorder} border`
      }`}
    >
      {/* Media Rendering */}
      {mediaType === 'video' && !hasError ? (
        <div className="relative w-full h-full group/video">
          <video
            ref={videoRef}
            src={mediaUrl}
            loop
            muted={isMuted}
            playsInline
            onError={() => setHasError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105"
          />

          {/* Video Control Overlays */}
          <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <button
              onClick={togglePlay}
              className="p-1.5 sm:p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 sm:p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <img
            src={hasError ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' : mediaUrl}
            alt={altText}
            onError={() => setHasError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      {/* Top Left Side & Type Badge */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
          {isSideA ? 'SIDE A' : 'SIDE B'}
        </span>
        <span className="p-1 rounded-md bg-black/60 border border-white/10 text-gray-300 backdrop-blur-md text-[10px]">
          {mediaType === 'video' ? <VideoIcon className="w-2.5 h-2.5 text-blue-400" /> : <ImageIcon className="w-2.5 h-2.5 text-purple-400" />}
        </span>
      </div>

      {/* Media Gradient Veil */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/80 via-transparent to-black/30 pointer-events-none" />

      {/* BENTO THEMED KING WINNER OVERLAY */}
      {isWinner && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-6 sm:pb-8 p-4 king-overlay backdrop-blur-sm transition-all duration-500 animate-in fade-in">
          {/* Yellow Pill KING Badge */}
          <div className="bg-yellow-400 text-black px-6 py-1 rounded-full font-black text-xs sm:text-sm mb-2 shadow-xl shadow-yellow-400/30 flex items-center gap-1.5 uppercase tracking-wide animate-bounce">
            <span>KING</span> 👑
          </div>

          <div className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter italic text-white text-center drop-shadow-lg font-syne">
            {altText}
          </div>

          <p className="mt-1 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-yellow-300">
            Winner of Community Duel
          </p>
        </div>
      )}
    </div>
  );
};

