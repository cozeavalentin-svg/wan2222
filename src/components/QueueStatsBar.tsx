import React from 'react';
import { QueueStats } from '../types.ts';
import { Language, translations } from '../utils/translations.ts';
import { Zap, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface QueueStatsBarProps {
  stats: QueueStats;
  isQueueRunning: boolean;
  lang: Language;
}

export const QueueStatsBar: React.FC<QueueStatsBarProps> = ({ stats, isQueueRunning, lang }) => {
  const t = translations[lang];
  const percentCompleted = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 mb-6 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Notice Banner */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">
                {isQueueRunning ? (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    {t.queueRunning}
                  </span>
                ) : (
                  <span className="text-zinc-400">{t.queueIdle}</span>
                )}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono">
                RunningHub Concurrency: {stats.maxConcurrency}x
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t.autoDispatchNotice}
            </p>
          </div>
        </div>

        {/* Progress Metrics & Bar */}
        <div className="w-full lg:w-96 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Progres Lot: <strong className="text-white font-mono">{stats.completed}/{stats.total}</strong> ({percentCompleted}%)
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {Math.floor(stats.totalDurationSeconds / 60)}m {stats.totalDurationSeconds % 60}s
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
