import React, { useState } from 'react';
import { X, Film, Download, Split, Play, Sparkles, ExternalLink, Search } from 'lucide-react';
import { Slot } from '../types.ts';
import { Language, translations } from '../utils/translations.ts';

interface OutputGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: Slot[];
  onCompare: (slot: Slot) => void;
  lang: Language;
}

export const OutputGalleryModal: React.FC<OutputGalleryModalProps> = ({
  isOpen,
  onClose,
  slots,
  onCompare,
  lang,
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const completedSlots = slots.filter(
    (s) => s.status === 'completed' && s.outputVideoUrl
  );

  const filtered = completedSlots.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.settings.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.galleryTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {completedSlots.length} Video-uri
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Toate generările Wan 2.2 descărcabile și comparabile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/20 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după nume sau prompt..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Gallery Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Niciun video generat încă</p>
              <p className="text-xs text-zinc-500 mt-1">
                Lansează coada pentru a genera primele video-uri Wan 2.2 cu motion control.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden group hover:border-amber-500/40 transition-all flex flex-col"
                >
                  <div className="h-52 bg-black relative overflow-hidden flex items-center justify-center">
                    <video
                      src={slot.outputVideoUrl}
                      controls
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                          {slot.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {slot.durationSeconds ? `${slot.durationSeconds}s` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                        {slot.settings.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <button
                        onClick={() => {
                          onCompare(slot);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                      >
                        <Split className="w-3 h-3" />
                        <span>Compară</span>
                      </button>

                      <a
                        href={slot.outputVideoUrl}
                        download={`wan22_${slot.name}.mp4`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descarcă</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
