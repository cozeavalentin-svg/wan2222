import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Download, Split, Sparkles, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Slot } from '../types.ts';
import { Language, translations } from '../utils/translations.ts';

interface SideBySideModalProps {
  slot: Slot | null;
  onClose: () => void;
  lang: Language;
}

export const SideBySideModal: React.FC<SideBySideModalProps> = ({ slot, onClose, lang }) => {
  const t = translations[lang];

  const refVideoRef = useRef<HTMLVideoElement>(null);
  const outVideoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!slot) return;
    setIsPlaying(false);
    setCurrentTime(0);
  }, [slot]);

  if (!slot || !slot.outputVideoUrl) return null;

  const togglePlay = () => {
    if (isPlaying) {
      refVideoRef.current?.pause();
      outVideoRef.current?.pause();
      setIsPlaying(false);
    } else {
      refVideoRef.current?.play();
      outVideoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (refVideoRef.current) refVideoRef.current.currentTime = time;
    if (outVideoRef.current) outVideoRef.current.currentTime = time;
  };

  const handleRestart = () => {
    if (refVideoRef.current) refVideoRef.current.currentTime = 0;
    if (outVideoRef.current) outVideoRef.current.currentTime = 0;
    setCurrentTime(0);
    refVideoRef.current?.play();
    outVideoRef.current?.play();
    setIsPlaying(true);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (refVideoRef.current) refVideoRef.current.playbackRate = rate;
    if (outVideoRef.current) outVideoRef.current.playbackRate = rate;
  };

  const onTimeUpdate = () => {
    if (outVideoRef.current) {
      setCurrentTime(outVideoRef.current.currentTime);
      if (outVideoRef.current.duration && !duration) {
        setDuration(outVideoRef.current.duration);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.compareSideBySide}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
                  {slot.name}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Mișcare de Referință vs. Poză Subiect vs. Video Generat Wan 2.2
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

        {/* Triple Split Video & Photo Area */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40">
          {/* 1. Reference Video (Motion Source) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <VideoIcon className="w-4 h-4" />
                1. Video Referință (Mișcare)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Original</span>
            </div>
            <div className="h-72 sm:h-80 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">
              {slot.videoUrl ? (
                <video
                  ref={refVideoRef}
                  src={slot.videoUrl}
                  className="w-full h-full object-contain"
                  loop
                  muted
                  playsInline
                />
              ) : (
                <span className="text-xs text-zinc-500">Lipsă video</span>
              )}
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-cyan-300 font-mono">
                Motion Control Input
              </span>
            </div>
          </div>

          {/* 2. Reference Image (Subject/Appearance Source) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                2. Poză Referință (Subiect)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Caracter</span>
            </div>
            <div className="h-72 sm:h-80 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">
              {slot.imageUrl ? (
                <img
                  src={slot.imageUrl}
                  alt="Subject Reference"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-zinc-500">Lipsă imagine</span>
              )}
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-300 font-mono">
                Visual Identity
              </span>
            </div>
          </div>

          {/* 3. Wan 2.2 Output Video (Generated Result) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                3. Video Generat Wan 2.2
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Output AI</span>
            </div>
            <div className="h-72 sm:h-80 rounded-2xl overflow-hidden bg-zinc-900 border border-emerald-500/30 flex items-center justify-center relative shadow-lg shadow-emerald-950/20">
              <video
                ref={outVideoRef}
                src={slot.outputVideoUrl}
                className="w-full h-full object-contain"
                loop
                playsInline
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-300 font-mono">
                RunningHub Wan 2.2
              </span>
            </div>
          </div>
        </div>

        {/* Synchronized Master Controls */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/90 space-y-3">
          {/* Scrubber bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 w-12 text-right">
              {currentTime.toFixed(1)}s
            </span>
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-zinc-400 w-12">
              {(duration || 0).toFixed(1)}s
            </span>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 font-semibold text-xs shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pauză Sincronizată' : 'Redare Sincronizată'}</span>
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                title="Reia de la început"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed rate selector */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
                {[0.5, 1, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-2 py-0.5 rounded-lg font-mono transition-all ${
                      playbackRate === rate
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={slot.outputVideoUrl}
                download={`wan22_${slot.name}.mp4`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Descarcă Rezultat MP4</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
