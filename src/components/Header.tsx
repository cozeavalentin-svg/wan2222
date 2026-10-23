import React from 'react';
import { Play, Pause, Square, Settings, Sparkles, Layers, Cpu, Globe, Terminal, Film } from 'lucide-react';
import { RunningHubConfig, QueueStats } from '../types.ts';
import { Language, translations } from '../utils/translations.ts';

interface HeaderProps {
  stats: QueueStats;
  isQueueRunning: boolean;
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onStopQueue: () => void;
  config: RunningHubConfig;
  onOpenSettings: () => void;
  onOpenGallery: () => void;
  onToggleConsole: () => void;
  showConsole: boolean;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  isQueueRunning,
  onStartQueue,
  onPauseQueue,
  onStopQueue,
  config,
  onOpenSettings,
  onOpenGallery,
  onToggleConsole,
  showConsole,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  {t.appTitle}
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Wan 2.2
                  </span>
                </h1>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* RunningHub Mode Indicator Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                config.simulatorMode
                  ? 'bg-purple-950/40 text-purple-300 border-purple-800/60 hover:bg-purple-900/40'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${config.simulatorMode ? 'bg-purple-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="font-medium">
                {config.simulatorMode ? t.simulatorMode : 'RunningHub Live'}
              </span>
            </button>
          </div>
        </div>

        {/* Center: Concurrency Slots & Quick Queue Stats */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800/80 px-3.5 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-2 pr-3 border-r border-zinc-800">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 font-medium">Slots (Max 2):</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  stats.running >= 1
                    ? 'bg-amber-400 shadow-md shadow-amber-400/50 animate-ping'
                    : 'bg-zinc-700'
                }`}
                title="Slot #1 status"
              />
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  stats.running >= 2
                    ? 'bg-amber-400 shadow-md shadow-amber-400/50 animate-ping'
                    : 'bg-zinc-700'
                }`}
                title="Slot #2 status"
              />
              <span className="font-mono font-bold text-white ml-1">
                {stats.running}/{config.concurrencyLimit || 2}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-zinc-400">
              {t.queued}: <strong className="text-amber-400 font-bold">{stats.queued}</strong>
            </span>
            <span className="text-zinc-400">
              {t.completed}: <strong className="text-emerald-400 font-bold">{stats.completed}</strong>
            </span>
            {stats.failed > 0 && (
              <span className="text-zinc-400">
                {t.failed}: <strong className="text-rose-400 font-bold">{stats.failed}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right: Primary Queue Control & Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Main Start / Pause Queue Button */}
          {!isQueueRunning ? (
            <button
              onClick={onStartQueue}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-semibold text-xs transition-all shadow-lg shadow-orange-500/25 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.startQueue}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onPauseQueue}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{t.pauseQueue}</span>
              </button>
              <button
                onClick={onStopQueue}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.stopQueue}</span>
              </button>
            </div>
          )}

          {/* Gallery Button */}
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
            title="Galerie video generate"
          >
            <Film className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Galerie ({stats.completed})</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all cursor-pointer"
            title={t.settings}
          >
            <Settings className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Console Log Drawer Toggle */}
          <button
            onClick={onToggleConsole}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showConsole
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border-zinc-800'
            }`}
            title={t.logsTitle}
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono font-bold transition-all cursor-pointer"
            title="Schimbă limba / Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
