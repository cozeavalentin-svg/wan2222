import React, { useState, useRef } from 'react';
import {
  Upload,
  Play,
  Pause,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  Split,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sliders,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Slot } from '../types.ts';
import { Language, translations } from '../utils/translations.ts';

interface SlotCardProps {
  slot: Slot;
  index: number;
  totalSlots: number;
  lang: Language;
  onUpdate: (slotId: string, updates: Partial<Slot>) => void;
  onDelete: (slotId: string) => void;
  onDuplicate: (slotId: string) => void;
  onMoveUp: (slotId: string) => void;
  onMoveDown: (slotId: string) => void;
  onQueueSingle: (slotId: string) => void;
  onCompare: (slot: Slot) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  index,
  totalSlots,
  lang,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onQueueSingle,
  onCompare,
}) => {
  const t = translations[lang];
  const [showSettings, setShowSettings] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const outputVideoRef = useRef<HTMLVideoElement>(null);

  // File handlers
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate(slot.id, {
        imageFile: file,
        imageUrl: url,
        imageName: file.name,
      });
    }
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate(slot.id, {
        videoFile: file,
        videoUrl: url,
        videoName: file.name,
      });
    }
  };

  // Drag and drop for image
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onUpdate(slot.id, {
        imageFile: file,
        imageUrl: url,
        imageName: file.name,
      });
    }
  };

  // Drag and drop for video
  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      onUpdate(slot.id, {
        videoFile: file,
        videoUrl: url,
        videoName: file.name,
      });
    }
  };

  const getStatusBadge = () => {
    switch (slot.status) {
      case 'idle':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
            {t.statusIdle}
          </span>
        );
      case 'queued':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {t.statusQueued}
          </span>
        );
      case 'uploading':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            {t.statusUploading}
          </span>
        );
      case 'running':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {t.statusRunning} ({slot.progress}%)
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.statusCompleted} {slot.durationSeconds ? `(${slot.durationSeconds}s)` : ''}
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.statusFailed}
          </span>
        );
      default:
        return null;
    }
  };

  const isConfigured = Boolean(slot.imageUrl && slot.videoUrl);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden bg-zinc-900/80 backdrop-blur-sm ${
        slot.status === 'running'
          ? 'border-cyan-500/50 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/30'
          : slot.status === 'completed'
          ? 'border-emerald-500/30 shadow-md shadow-emerald-950/20'
          : slot.status === 'failed'
          ? 'border-rose-500/40'
          : 'border-zinc-800 hover:border-zinc-700/80'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            #{index + 1}
          </span>
          <input
            type="text"
            value={slot.name}
            onChange={(e) => onUpdate(slot.id, { name: e.target.value })}
            className="text-sm font-semibold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-amber-500 focus:outline-none transition-all px-1 py-0.5 max-w-[200px] sm:max-w-[280px]"
            placeholder="Nume Slot..."
          />
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}

          {/* Quick Actions */}
          <div className="flex items-center gap-1 ml-2 text-zinc-400">
            {index > 0 && (
              <button
                onClick={() => onMoveUp(slot.id)}
                className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Mută sus"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
            {index < totalSlots - 1 && (
              <button
                onClick={() => onMoveDown(slot.id)}
                className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Mută jos"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDuplicate(slot.id)}
              className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Duplică slotul"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(slot.id)}
              className="p-1 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
              title="Șterge slotul"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Reference Image + Reference Video + Output Preview */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Reference Image */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              {t.referenceImage}
            </span>
            {slot.imageName && (
              <span className="text-[10px] text-zinc-400 truncate max-w-[140px]" title={slot.imageName}>
                {slot.imageName}
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            onClick={() => !slot.imageUrl && imageInputRef.current?.click()}
            className={`h-48 rounded-xl border border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all group ${
              slot.imageUrl
                ? 'border-zinc-700 bg-zinc-950'
                : 'border-zinc-800 hover:border-amber-500/50 bg-zinc-950/50 hover:bg-zinc-900/50 cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageFile}
              accept="image/*"
              className="hidden"
            />

            {slot.imageUrl ? (
              <>
                <img
                  src={slot.imageUrl}
                  alt="Reference character"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      imageInputRef.current?.click();
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-900/90 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Înlocuiește
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(slot.id, { imageUrl: '', imageFile: null, imageName: '' });
                    }}
                    className="px-2 py-1 rounded bg-rose-950/80 text-rose-300 text-xs font-medium hover:bg-rose-900 transition-colors"
                  >
                    Șterge
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2 group-hover:border-amber-500/40">
                  <Upload className="w-4 h-4 text-zinc-400 group-hover:text-amber-400" />
                </div>
                <p className="text-xs font-medium text-zinc-300">{t.dropImageOrClick}</p>
                <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG, WebP</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Reference Video (Motion guidance) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <VideoIcon className="w-3.5 h-3.5 text-cyan-400" />
              {t.referenceVideo}
            </span>
            {slot.videoName && (
              <span className="text-[10px] text-zinc-400 truncate max-w-[140px]" title={slot.videoName}>
                {slot.videoName}
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleVideoDrop}
            onClick={() => !slot.videoUrl && videoInputRef.current?.click()}
            className={`h-48 rounded-xl border border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all group ${
              slot.videoUrl
                ? 'border-zinc-700 bg-zinc-950'
                : 'border-zinc-800 hover:border-cyan-500/50 bg-zinc-950/50 hover:bg-zinc-900/50 cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoFile}
              accept="video/*"
              className="hidden"
            />

            {slot.videoUrl ? (
              <>
                <video
                  ref={videoPreviewRef}
                  src={slot.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  onPlay={() => setIsPlayingVideo(true)}
                  onPause={() => setIsPlayingVideo(false)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoPreviewRef.current) {
                      if (isPlayingVideo) {
                        videoPreviewRef.current.pause();
                      } else {
                        videoPreviewRef.current.play();
                      }
                    }
                  }}
                  className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 transition-all backdrop-blur-sm"
                  title={isPlayingVideo ? 'Pauză' : 'Redă'}
                >
                  {isPlayingVideo ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      videoInputRef.current?.click();
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-900/90 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Înlocuiește
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(slot.id, { videoUrl: '', videoFile: null, videoName: '' });
                    }}
                    className="px-2 py-1 rounded bg-rose-950/80 text-rose-300 text-xs font-medium hover:bg-rose-900 transition-colors"
                  >
                    Șterge
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2 group-hover:border-cyan-500/40">
                  <Upload className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-xs font-medium text-zinc-300">{t.dropVideoOrClick}</p>
                <p className="text-[10px] text-zinc-400 mt-1">MP4, MOV, WebM</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Wan 2.2 Output Video Preview */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {t.outputVideo}
            </span>
            {slot.completedAt && (
              <span className="text-[10px] text-emerald-400 font-mono">
                Gata în {slot.durationSeconds}s
              </span>
            )}
          </div>

          <div className="h-48 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
            {slot.status === 'completed' && slot.outputVideoUrl ? (
              <div className="w-full h-full relative group">
                <video
                  ref={outputVideoRef}
                  src={slot.outputVideoUrl}
                  className="w-full h-full object-cover"
                  controls
                  loop
                  playsInline
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onCompare(slot)}
                    className="p-1.5 rounded-lg bg-zinc-900/90 text-amber-400 hover:bg-zinc-800 border border-zinc-700/80 shadow-md backdrop-blur-sm transition-all"
                    title={t.compareSideBySide}
                  >
                    <Split className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={slot.outputVideoUrl}
                    download={`wan22_motion_${slot.name}.mp4`}
                    className="p-1.5 rounded-lg bg-zinc-900/90 text-white hover:bg-zinc-800 border border-zinc-700/80 shadow-md backdrop-blur-sm transition-all"
                    title={t.downloadVideo}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : slot.status === 'running' || slot.status === 'uploading' ? (
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <div className="relative mb-3">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan-300">
                    {slot.progress}%
                  </div>
                </div>
                <p className="text-xs font-semibold text-zinc-200 animate-pulse">
                  {slot.status === 'uploading' ? 'Încărcare pe RunningHub...' : 'Wan 2.2 generează mișcarea...'}
                </p>
                {slot.taskId && (
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">
                    Task: {slot.taskId.substring(0, 16)}...
                  </p>
                )}
                {/* Visual Progress Bar */}
                <div className="w-3/4 h-1.5 rounded-full bg-zinc-800 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.max(5, slot.progress)}%` }}
                  />
                </div>
              </div>
            ) : slot.status === 'failed' ? (
              <div className="flex flex-col items-center text-center p-4">
                <AlertTriangle className="w-8 h-8 text-rose-400 mb-2" />
                <p className="text-xs font-medium text-rose-300">{t.statusFailed}</p>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] line-clamp-2">
                  {slot.errorMessage || 'Eroare necunoscută'}
                </p>
                <button
                  onClick={() => onQueueSingle(slot.id)}
                  className="mt-3 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition-all"
                >
                  Reîncearcă
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-4 text-zinc-400">
                <Sparkles className="w-6 h-6 text-zinc-400 mb-2" />
                <p className="text-xs text-zinc-400 max-w-[180px]">
                  {slot.status === 'queued' ? 'În așteptare în coadă...' : t.noOutputYet}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accordion / Drawer for Wan 2.2 Settings */}
      {showSettings && (
        <div className="px-4 py-3.5 border-t border-zinc-800/80 bg-zinc-950/60 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              {t.promptLabel}
            </label>
            <textarea
              rows={2}
              value={slot.settings.prompt}
              onChange={(e) =>
                onUpdate(slot.id, {
                  settings: { ...slot.settings, prompt: e.target.value },
                })
              }
              className="w-full text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 p-2.5 focus:border-amber-500 focus:outline-none"
              placeholder="Descrie mișcarea Wan 2.2..."
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Motion Strength</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="2.0"
                value={slot.settings.motionStrength}
                onChange={(e) =>
                  onUpdate(slot.id, {
                    settings: {
                      ...slot.settings,
                      motionStrength: parseFloat(e.target.value) || 1.0,
                    },
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 p-1.5 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Sampling Steps</label>
              <input
                type="number"
                min="10"
                max="50"
                value={slot.settings.steps}
                onChange={(e) =>
                  onUpdate(slot.id, {
                    settings: {
                      ...slot.settings,
                      steps: parseInt(e.target.value, 10) || 30,
                    },
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 p-1.5 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">{t.resolution}</label>
              <select
                value={slot.settings.resolution}
                onChange={(e) =>
                  onUpdate(slot.id, {
                    settings: {
                      ...slot.settings,
                      resolution: e.target.value as '720p' | '480p' | '1080p',
                    },
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 p-1.5 focus:border-amber-500 focus:outline-none"
              >
                <option value="720p">720p (Recomandat)</option>
                <option value="480p">480p (Rapid)</option>
                <option value="1080p">1080p (Ultra)</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">{t.aspectRatio}</label>
              <select
                value={slot.settings.aspectRatio}
                onChange={(e) =>
                  onUpdate(slot.id, {
                    settings: {
                      ...slot.settings,
                      aspectRatio: e.target.value as '9:16' | '16:9' | '1:1' | '4:3',
                    },
                  })
                }
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 p-1.5 focus:border-amber-500 focus:outline-none"
              >
                <option value="9:16">9:16 (Vertical TikTok/Reels)</option>
                <option value="16:9">16:9 (Landscape YouTube)</option>
                <option value="1:1">1:1 (Pătrat)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/80 bg-zinc-950/20 text-xs">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showSettings ? 'Ascunde Setări Wan 2.2' : t.motionSettings}</span>
        </button>

        <div className="flex items-center gap-2">
          {slot.status === 'completed' && (
            <button
              onClick={() => onCompare(slot)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-medium transition-all"
            >
              <Split className="w-3.5 h-3.5" />
              <span>{t.compareSideBySide}</span>
            </button>
          )}

          {slot.status === 'idle' && (
            <button
              disabled={!isConfigured}
              onClick={() => onQueueSingle(slot.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
                isConfigured
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <span>Pune în Coadă</span>
            </button>
          )}

          {slot.status === 'queued' && (
            <button
              onClick={() => onUpdate(slot.id, { status: 'idle' })}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
            >
              Scoate din Coadă
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
