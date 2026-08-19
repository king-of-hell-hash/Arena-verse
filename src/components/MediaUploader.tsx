import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Video as VideoIcon, Trash2, RefreshCw, Link as LinkIcon, Check, AlertCircle, Sparkles } from 'lucide-react';
import { MediaType } from '../types';
import { saveMediaFile, formatFileSize } from '../utils/mediaStorage';

interface MediaUploaderProps {
  mediaType: MediaType;
  mediaUrl: string;
  sideLabel: string;
  accentColor?: 'blue' | 'purple';
  onMediaChange: (newUrl: string, detectedType: MediaType, fileName?: string) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaType,
  mediaUrl,
  sideLabel,
  accentColor = 'blue',
  onMediaChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [inputUrl, setInputUrl] = useState(mediaUrl);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(() => {
    if (mediaUrl.startsWith('data:')) return 'Uploaded File';
    if (mediaUrl.includes('/')) {
      const parts = mediaUrl.split('/');
      return parts[parts.length - 1].split('?')[0] || 'Selected Media';
    }
    return null;
  });

  const isBlue = accentColor === 'blue';
  const themeBorder = isBlue ? 'border-blue-500/40' : 'border-purple-500/40';
  const themeBg = isBlue ? 'bg-blue-600' : 'bg-purple-600';
  const themeText = isBlue ? 'text-blue-400' : 'text-purple-400';
  const themeGlow = isBlue ? 'shadow-blue-500/20' : 'shadow-purple-500/20';

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);

    // Validate size (limit to 60MB for in-browser client safety)
    const MAX_SIZE = 60 * 1024 * 1024; // 60MB
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File is too large (${formatFileSize(file.size)}). Max allowed is 60 MB.`);
      return;
    }

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name);
    const isImage = file.type.startsWith('image/') || /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(file.name);

    if (!isImage && !isVideo) {
      setErrorMessage('Unsupported file format. Please choose an image (JPG, PNG, WebP) or video (MP4, MOV).');
      return;
    }

    setIsProcessing(true);
    try {
      const record = await saveMediaFile(file);
      const detectedType: MediaType = isVideo ? 'video' : 'image';
      setSelectedFileName(`${file.name} (${formatFileSize(file.size)})`);
      onMediaChange(record.dataUrl, detectedType, file.name);
    } catch (err) {
      console.error('Error processing media file:', err);
      setErrorMessage('Failed to process file from your device. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedFileName(null);
    setInputUrl('');
    // Default placeholder
    const placeholder = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    onMediaChange(placeholder, 'image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!inputUrl.trim()) return;
    const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(inputUrl) || inputUrl.includes('video');
    onMediaChange(inputUrl.trim(), isVideo ? 'video' : 'image');
    setSelectedFileName('Web URL Reference');
  };

  return (
    <div className="space-y-2">
      {/* Hidden Native Mobile & Desktop File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/quicktime,video/webm,video/x-m4v,video/*,image/*"
        onChange={handleInputChange}
        className="hidden"
        id={`file-picker-${sideLabel.replace(/\s+/g, '-').toLowerCase()}`}
      />

      {/* Main Upload Box / Dropzone */}
      {!isUrlMode ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl p-3 border border-dashed transition-all ${
            isDragging
              ? `${themeBorder} bg-white/10 scale-[1.01]`
              : 'border-white/20 bg-black/40 hover:border-white/30'
          }`}
        >
          {mediaUrl ? (
            <div className="flex items-center gap-3">
              {/* Media Thumbnail Preview */}
              <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/60">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-white text-[8px]">
                  {mediaType === 'video' ? <VideoIcon className="w-2.5 h-2.5 text-blue-400" /> : <ImageIcon className="w-2.5 h-2.5 text-purple-400" />}
                </span>
              </div>

              {/* File Info & Actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${themeText}`}>
                    {mediaType === 'video' ? 'Video File' : 'Photo File'}
                  </span>
                  {selectedFileName && (
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Ready
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-gray-200 truncate" title={selectedFileName || mediaUrl}>
                  {selectedFileName || 'Custom Media Loaded'}
                </p>

                {/* Replace / Remove Controls */}
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${themeBg} hover:opacity-90 text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm ${themeGlow}`}
                  >
                    <Upload className="w-2.5 h-2.5" />
                    {isProcessing ? 'Processing...' : 'Change File'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="px-2 py-1 rounded-md text-[10px] font-mono text-gray-400 hover:text-red-400 hover:bg-white/5 border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State: Choose from Gallery Prompt */
            <div className="flex flex-col items-center justify-center text-center py-3 px-2">
              <div className={`p-2.5 rounded-full ${isBlue ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'} mb-2 border border-white/10`}>
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white font-mono">
                Upload Photo or Video
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                Tap to pick from camera roll / files or drag & drop here
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className={`mt-2.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider ${themeBg} text-white shadow-md ${themeGlow} hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5`}
              >
                <Upload className="w-3.5 h-3.5" />
                {isProcessing ? 'Processing File...' : 'Choose from Gallery'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Alternative URL Input Mode */
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste direct image or .mp4 video URL..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${themeBg} text-white hover:opacity-90 cursor-pointer`}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <p className="text-[10px] text-red-400 font-mono flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> {errorMessage}
        </p>
      )}

      {/* Mode Switcher Link (Gallery Upload vs Direct URL) */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-0.5">
        <span>Accepted: JPG, PNG, WebP, MP4, MOV (up to 60MB)</span>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-gray-400 hover:text-white underline cursor-pointer flex items-center gap-1"
        >
          {isUrlMode ? (
            <>
              <Upload className="w-2.5 h-2.5" /> Switch to Gallery Upload
            </>
          ) : (
            <>
              <LinkIcon className="w-2.5 h-2.5" /> Paste URL instead
            </>
          )}
        </button>
      </div>
    </div>
  );
};
