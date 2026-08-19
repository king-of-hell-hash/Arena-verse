import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, RefreshCw, Sparkles, Check, Ratio, Maximize2 } from 'lucide-react';
import { saveMediaFile, formatFileSize } from '../utils/mediaStorage';

export type AspectRatioOption = '1:1' | '16:9' | '4:3' | '4:5';

interface PhotoInFrameProps {
  initialImageUrl?: string;
  altText?: string;
  sideLabel?: string;
  defaultRatio?: AspectRatioOption;
  accentColor?: 'blue' | 'purple';
  onImageChange?: (imageUrl: string, fileName?: string) => void;
  onRemoveImage?: () => void;
}

export const PhotoInFrame: React.FC<PhotoInFrameProps> = ({
  initialImageUrl,
  altText = 'Framed Photo',
  sideLabel = 'Photo Frame',
  defaultRatio = '1:1',
  accentColor = 'blue',
  onImageChange,
  onRemoveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(defaultRatio);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(() => {
    if (initialImageUrl && !initialImageUrl.startsWith('data:')) {
      const parts = initialImageUrl.split('/');
      return parts[parts.length - 1].split('?')[0] || 'Photo';
    }
    return initialImageUrl ? 'Framed Image' : null;
  });

  const isBlue = accentColor === 'blue';
  const themeBorder = isBlue ? 'border-blue-500/50' : 'border-purple-500/50';
  const themeGlow = isBlue ? 'shadow-blue-500/20' : 'shadow-purple-500/20';
  const themeBg = isBlue ? 'bg-blue-600' : 'bg-purple-600';
  const themeText = isBlue ? 'text-blue-400' : 'text-purple-400';

  // Ratio styling
  const ratioClasses: Record<AspectRatioOption, string> = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '4:5': 'aspect-[4/5]',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP, GIF, SVG).');
      return;
    }

    setIsProcessing(true);
    try {
      const record = await saveMediaFile(file);
      setImageUrl(record.dataUrl);
      setFileName(`${file.name} (${formatFileSize(file.size)})`);
      if (onImageChange) {
        onImageChange(record.dataUrl, file.name);
      }
    } catch (err) {
      console.error('Failed to process image file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setImageUrl('');
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemoveImage) {
      onRemoveImage();
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input for Native Media Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`photo-frame-input-${sideLabel.replace(/\s+/g, '-').toLowerCase()}`}
      />

      {/* Frame Container */}
      <div className="relative group">
        <div
          className={`relative w-full ${ratioClasses[aspectRatio]} rounded-2xl overflow-hidden glass-card border-2 ${
            imageUrl ? `${themeBorder} ${themeGlow} shadow-xl` : 'border-dashed border-white/20'
          } bg-[#06060c] flex items-center justify-center transition-all duration-300`}
        >
          {imageUrl ? (
            <>
              {/* Constrained Auto-Fit Image */}
              <img
                src={imageUrl}
                alt={altText}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top Bar inside Frame */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-gray-300">
                  {aspectRatio} Ratio
                </span>
                <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Framed
                </span>
              </div>

              {/* Hover / Active Action Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className={`px-3 py-1.5 rounded-xl ${themeBg} text-white text-xs font-mono font-bold shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isProcessing ? 'Loading...' : 'Replace Photo'}
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-mono font-bold shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </>
          ) : (
            /* Empty Frame Placeholder */
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className={`p-3 rounded-2xl ${isBlue ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'} border border-white/10 mb-2`}>
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold font-mono text-white">No Photo Framed</p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                Pick a photo from your gallery to fit in this {aspectRatio} frame
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className={`mt-3 px-4 py-2 rounded-xl ${themeBg} hover:opacity-95 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg ${themeGlow} flex items-center gap-2 transition-all active:scale-95 cursor-pointer`}
              >
                <Upload className="w-3.5 h-3.5" />
                {isProcessing ? 'Processing Image...' : 'Choose from Gallery'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Frame Ratio Selector & Controls */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-mono">
        <div className="flex items-center gap-1 text-gray-400">
          <Ratio className="w-3 h-3 text-purple-400" />
          <span className="hidden sm:inline">Frame Ratio:</span>
        </div>

        <div className="flex items-center gap-1">
          {(['1:1', '16:9', '4:3', '4:5'] as AspectRatioOption[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setAspectRatio(r)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                aspectRatio === r
                  ? `${themeBg} text-white font-bold`
                  : 'bg-black/40 text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {imageUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`${themeText} hover:underline font-bold flex items-center gap-1 cursor-pointer ml-auto`}
          >
            <Upload className="w-2.5 h-2.5" /> Swap
          </button>
        )}
      </div>
    </div>
  );
};
