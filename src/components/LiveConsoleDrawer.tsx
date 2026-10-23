import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, X, ChevronDown } from 'lucide-react';
import { Language, translations } from '../utils/translations.ts';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

interface LiveConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClear: () => void;
  lang: Language;
}

export const LiveConsoleDrawer: React.FC<LiveConsoleDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClear,
  lang,
}) => {
  const t = translations[lang];
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 shadow-2xl backdrop-blur-md animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-800 bg-zinc-900/60 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-mono font-medium">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>{t.logsTitle}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
            {logs.length} mesaje
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Șterge</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs container */}
      <div className="h-44 overflow-y-auto p-4 font-mono text-xs space-y-1.5 select-text bg-black/60">
        {logs.length === 0 ? (
          <p className="text-zinc-600 italic">Niciun eveniment înregistrat încă.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-zinc-500 shrink-0 text-[10px]">{log.timestamp}</span>
              <span
                className={`font-semibold shrink-0 text-[10px] uppercase px-1 rounded ${
                  log.level === 'success'
                    ? 'bg-emerald-950 text-emerald-400'
                    : log.level === 'warn'
                    ? 'bg-amber-950 text-amber-400'
                    : log.level === 'error'
                    ? 'bg-rose-950 text-rose-400'
                    : 'bg-zinc-800 text-cyan-400'
                }`}
              >
                [{log.level}]
              </span>
              <span
                className={
                  log.level === 'error'
                    ? 'text-rose-300'
                    : log.level === 'success'
                    ? 'text-emerald-300'
                    : log.level === 'warn'
                    ? 'text-amber-300'
                    : 'text-zinc-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
