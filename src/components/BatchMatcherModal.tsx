import React, { useState } from 'react';
import { X, Upload, Check, Sparkles, Image as ImageIcon, Video as VideoIcon, ArrowRight } from 'lucide-react';
import { Language, translations } from '../utils/translations.ts';
import { autoMatchPairs, createSlot } from '../utils/queueEngine.ts';
import { Slot } from '../types.ts';

interface BatchMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSlots: (slots: Slot[]) => void;
  lang: Language;
}

interface FileItem {
  file: File;
  name: string;
  url: string;
}

export const BatchMatcherModal: React.FC<BatchMatcherModalProps> = ({
  isOpen,
  onClose,
  onAddSlots,
  lang,
}) => {
  const t = translations[lang];

  const [images, setImages] = useState<FileItem[]>([]);
  const [videos, setVideos] = useState<FileItem[]>([]);

  if (!isOpen) return null;

  const handleImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems: FileItem[] = files.map((f) => ({
      file: f,
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const handleVideoFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems: FileItem[] = files.map((f) => ({
      file: f,
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setVideos((prev) => [...prev, ...newItems]);
  };

  const matches = autoMatchPairs(
    images.map((img) => img.name),
    videos.map((vid) => vid.name)
  );

  const handleGenerateSlots = () => {
    if (matches.length === 0) return;

    const newSlots: Slot[] = matches.map((match, idx) => {
      const imgObj = images.find((i) => i.name === match.imageName);
      const vidObj = videos.find((v) => v.name === match.videoName);

      return createSlot(idx, {
        name: `Batch #${idx + 1} - ${match.videoName.replace(/\.[^/.]+$/, '')}`,
        status: 'queued', // directly queue for immediate auto processing!
        imageFile: imgObj?.file || null,
        imageUrl: imgObj?.url || '',
        imageName: imgObj?.name || '',
        videoFile: vidObj?.file || null,
        videoUrl: vidObj?.url || '',
        videoName: vidObj?.name || '',
      });
    });

    onAddSlots(newSlots);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.batchMatcherTitle}</h2>
              <p className="text-xs text-zinc-400">{t.batchMatcherDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Upload Dropzones Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Selector */}
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  {t.selectImages} ({images.length})
                </span>
                {images.length > 0 && (
                  <button
                    onClick={() => setImages([])}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Resetează
                  </button>
                )}
              </div>
              <label className="border border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-zinc-950/60 hover:bg-zinc-900/60 transition-all text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFiles}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="text-xs text-zinc-300 font-medium">Click sau trage pozele aici</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Selecție multiplă (PNG, JPG, WebP)</span>
              </label>

              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {images.map((img, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 truncate max-w-[140px]"
                    >
                      {img.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Video Selector */}
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <VideoIcon className="w-4 h-4 text-cyan-400" />
                  {t.selectVideos} ({videos.length})
                </span>
                {videos.length > 0 && (
                  <button
                    onClick={() => setVideos([])}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Resetează
                  </button>
                )}
              </div>
              <label className="border border-dashed border-zinc-700 hover:border-cyan-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-zinc-950/60 hover:bg-zinc-900/60 transition-all text-center">
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoFiles}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="text-xs text-zinc-300 font-medium">Click sau trage video-urile aici</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Selecție multiplă (MP4, MOV, WebM)</span>
              </label>

              {videos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {videos.map((vid, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 truncate max-w-[140px]"
                    >
                      {vid.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Matches Preview Table */}
          {matches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">
                  Perechi Detectate Automat ({matches.length} Sloturi)
                </span>
                <span className="text-[11px] text-amber-400">
                  Potrivire inteligentă după nume și secvență
                </span>
              </div>
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/30">
                <div className="grid grid-cols-12 text-[11px] font-semibold text-zinc-400 px-4 py-2 border-b border-zinc-800 bg-zinc-950/50">
                  <span className="col-span-1">#</span>
                  <span className="col-span-5">Poză de Referință</span>
                  <span className="col-span-1 text-center">→</span>
                  <span className="col-span-5">Video de Referință (Mișcare)</span>
                </div>
                <div className="divide-y divide-zinc-800/60 max-h-56 overflow-y-auto">
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 items-center text-xs px-4 py-2 hover:bg-zinc-800/30 transition-colors"
                    >
                      <span className="col-span-1 font-mono text-zinc-400 font-bold">
                        {idx + 1}
                      </span>
                      <span className="col-span-5 text-amber-300 truncate font-mono">
                        {m.imageName || <em className="text-zinc-500 font-sans">Lipsă</em>}
                      </span>
                      <span className="col-span-1 text-center text-zinc-400">
                        <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                      </span>
                      <span className="col-span-5 text-cyan-300 truncate font-mono">
                        {m.videoName || <em className="text-zinc-500 font-sans">Lipsă</em>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/80">
          <span className="text-xs text-zinc-400">
            {matches.length} sloturi pregătite pentru coadă
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Anulează
            </button>
            <button
              disabled={matches.length === 0}
              onClick={handleGenerateSlots}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                matches.length > 0
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{t.createSlotsFromMatches} ({matches.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
