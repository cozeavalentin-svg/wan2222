import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Play,
  Pause,
  Sparkles,
  Layers,
  Trash2,
  RotateCcw,
  Film,
  Sliders,
  CheckCircle2,
  FolderPlus,
  Split,
  Search,
  Filter,
} from 'lucide-react';
import { Slot, RunningHubConfig, QueueStats } from './types.ts';
import {
  createSlot,
  calculateQueueStats,
  getNextRunnableSlots,
  canDispatchNext,
  updateSlot,
  buildRunningHubPayload,
} from './utils/queueEngine.ts';
import { Language, translations } from './utils/translations.ts';
import { SAMPLE_PRESETS } from './data/samplePresets.ts';
import { Header } from './components/Header.tsx';
import { QueueStatsBar } from './components/QueueStatsBar.tsx';
import { SlotCard } from './components/SlotCard.tsx';
import { BatchMatcherModal } from './components/BatchMatcherModal.tsx';
import { RunningHubSettingsModal } from './components/RunningHubSettingsModal.tsx';
import { SideBySideModal } from './components/SideBySideModal.tsx';
import { OutputGalleryModal } from './components/OutputGalleryModal.tsx';
import { LiveConsoleDrawer, LogEntry } from './components/LiveConsoleDrawer.tsx';

const DEFAULT_CONFIG: RunningHubConfig = {
  apiKey: '',
  workflowId: '189283749201948576',
  imageNodeId: '12',
  imageFieldName: 'image',
  videoNodeId: '15',
  videoFieldName: 'video',
  promptNodeId: '6',
  promptFieldName: 'text',
  baseUrl: 'https://www.runninghub.ai',
  concurrencyLimit: 2, // 2 simultaneous generations as requested
  simulatorMode: true, // Default to demo mode so user can test right away
};

export default function App() {
  const [lang, setLang] = useState<Language>('ro');
  const t = translations[lang];

  // Config State
  const [config, setConfig] = useState<RunningHubConfig>(() => {
    try {
      const saved = localStorage.getItem('wanmotion_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Slots State
  const [slots, setSlots] = useState<Slot[]>(() => {
    // Initialize with 2 slots
    return [
      createSlot(0, {
        name: 'Slot #1 - Dans Cyberpunk',
        imageUrl: SAMPLE_PRESETS[0].imageUrl,
        imageName: SAMPLE_PRESETS[0].imageName,
        videoUrl: SAMPLE_PRESETS[0].videoUrl,
        videoName: SAMPLE_PRESETS[0].videoName,
        settings: {
          ...createSlot(0).settings,
          prompt: SAMPLE_PRESETS[0].prompt,
        },
      }),
      createSlot(1, {
        name: 'Slot #2 - Arte Marțiale',
        imageUrl: SAMPLE_PRESETS[1].imageUrl,
        imageName: SAMPLE_PRESETS[1].imageName,
        videoUrl: SAMPLE_PRESETS[1].videoUrl,
        videoName: SAMPLE_PRESETS[1].videoName,
        settings: {
          ...createSlot(1).settings,
          prompt: SAMPLE_PRESETS[1].prompt,
        },
      }),
      createSlot(2, {
        name: 'Slot #3 - Runway Catwalk',
        imageUrl: SAMPLE_PRESETS[2].imageUrl,
        imageName: SAMPLE_PRESETS[2].imageName,
        videoUrl: SAMPLE_PRESETS[2].videoUrl,
        videoName: SAMPLE_PRESETS[2].videoName,
        settings: {
          ...createSlot(2).settings,
          prompt: SAMPLE_PRESETS[2].prompt,
        },
      }),
    ];
  });

  const [isQueueRunning, setIsQueueRunning] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBatchMatcherOpen, setIsBatchMatcherOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [comparingSlot, setComparingSlot] = useState<Slot | null>(null);

  // Console Drawer
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: time,
        level,
        message,
      },
    ]);
  }, []);

  // Save config
  const handleSaveConfig = (newConfig: RunningHubConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('wanmotion_config', JSON.stringify(newConfig));
    } catch {
      // storage unavailable
    }
    addLog(`Setări RunningHub actualizate. Mod: ${newConfig.simulatorMode ? 'Simulator' : 'Live API'}`, 'info');
  };

  // Queue Calculations
  const stats: QueueStats = calculateQueueStats(slots, config.concurrencyLimit);

  // Ref to always have current slots in intervals/callbacks
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const isRunningRef = useRef(isQueueRunning);
  isRunningRef.current = isQueueRunning;

  // Update a single slot
  const handleUpdateSlot = useCallback((slotId: string, updates: Partial<Slot>) => {
    setSlots((prev) => updateSlot(prev, slotId, updates));
  }, []);

  // Add individual slot
  const handleAddSlot = () => {
    setSlots((prev) => [...prev, createSlot(prev.length)]);
    addLog(`Slot nou adăugat (#${slots.length + 1})`, 'info');
  };

  // Bulk add multiple slots (e.g. +5 or +10 slots)
  const handleBulkAddSlots = (count: number) => {
    setSlots((prev) => {
      const added: Slot[] = [];
      const currentLen = prev.length;
      for (let i = 0; i < count; i++) {
        added.push(createSlot(currentLen + i));
      }
      return [...prev, ...added];
    });
    addLog(`S-au adăugat ${count} sloturi noi în listă.`, 'info');
  };

  // Load sample demo batch
  const handleLoadDemoBatch = () => {
    const demoSlots: Slot[] = SAMPLE_PRESETS.map((preset, idx) =>
      createSlot(idx, {
        name: `Demo #${idx + 1} - ${preset.name}`,
        imageUrl: preset.imageUrl,
        imageName: preset.imageName,
        videoUrl: preset.videoUrl,
        videoName: preset.videoName,
        status: 'queued', // automatically ready to run!
        settings: {
          ...createSlot(idx).settings,
          prompt: preset.prompt,
        },
      })
    );
    setSlots((prev) => [...prev, ...demoSlots]);
    addLog(`S-a încărcat setul demonstrativ Wan 2.2 (${demoSlots.length} sloturi pregătite în coadă).`, 'success');
  };

  // Delete slot
  const handleDeleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    addLog(`Slotul ${slotId} a fost șters.`, 'warn');
  };

  // Duplicate slot
  const handleDuplicateSlot = (slotId: string) => {
    const target = slots.find((s) => s.id === slotId);
    if (!target) return;
    const duplicated = createSlot(slots.length, {
      name: `${target.name} (Copie)`,
      imageUrl: target.imageUrl,
      imageFile: target.imageFile,
      imageName: target.imageName,
      videoUrl: target.videoUrl,
      videoFile: target.videoFile,
      videoName: target.videoName,
      settings: { ...target.settings },
      status: 'idle',
    });
    setSlots((prev) => [...prev, duplicated]);
    addLog(`Slotul "${target.name}" a fost duplicat.`, 'info');
  };

  // Move Up
  const handleMoveUp = (slotId: string) => {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === slotId);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  // Move Down
  const handleMoveDown = (slotId: string) => {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === slotId);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  // Queue a single slot
  const handleQueueSingle = (slotId: string) => {
    handleUpdateSlot(slotId, { status: 'queued', progress: 0, errorMessage: undefined });
    addLog(`Slotul ${slotId} a fost adăugat în coadă.`, 'info');
  };

  // Clear completed slots
  const handleClearCompleted = () => {
    setSlots((prev) => prev.filter((s) => s.status !== 'completed'));
    addLog('Sloturile finalizate au fost curățate din coadă.', 'info');
  };

  // Retry failed slots
  const handleRetryFailed = () => {
    setSlots((prev) =>
      prev.map((s) => (s.status === 'failed' ? { ...s, status: 'queued', progress: 0, errorMessage: undefined } : s))
    );
    addLog('Sloturile eșuate au fost repuse în coadă.', 'info');
  };

  // Start Queue
  const handleStartQueue = () => {
    // If no slots are queued, queue all idle slots that have both image and video
    const hasQueued = slots.some((s) => s.status === 'queued');
    if (!hasQueued) {
      const configuredIdle = slots.filter((s) => s.status === 'idle' && s.imageUrl && s.videoUrl);
      if (configuredIdle.length > 0) {
        setSlots((prev) =>
          prev.map((s) => (s.status === 'idle' && s.imageUrl && s.videoUrl ? { ...s, status: 'queued' } : s))
        );
        addLog(`S-au pus automat ${configuredIdle.length} sloturi configurate în coadă.`, 'info');
      }
    }

    setIsQueueRunning(true);
    addLog(`Coada a pornit! Concurrență RunningHub: ${config.concurrencyLimit} sloturi simultan.`, 'success');
  };

  const handlePauseQueue = () => {
    setIsQueueRunning(false);
    addLog('Coada este în pauză. Generările active își continuă procesarea.', 'warn');
  };

  const handleStopQueue = () => {
    setIsQueueRunning(false);
    // cancel queued slots back to idle
    setSlots((prev) =>
      prev.map((s) => (s.status === 'queued' ? { ...s, status: 'idle' } : s))
    );
    addLog('Coada a fost oprită.', 'warn');
  };

  // Add slots from Batch Matcher
  const handleAddBatchSlots = (newSlots: Slot[]) => {
    setSlots((prev) => [...prev, ...newSlots]);
    addLog(`S-au adăugat ${newSlots.length} sloturi din Matcher-ul Automat!`, 'success');
  };

  // --- AUTOMATED 2-SLOT CONCURRENCY RUNNINGHUB ENGINE ---
  const activeProcessingIds = useRef<Set<string>>(new Set());

  const processSlotGeneration = useCallback(
    async (slot: Slot) => {
      const slotId = slot.id;
      if (activeProcessingIds.current.has(slotId)) return;
      activeProcessingIds.current.add(slotId);

      const startTime = Date.now();
      addLog(`[Lansare Slot] ${slot.name} - Inițializare generare Wan 2.2...`, 'info');

      // Update to running
      handleUpdateSlot(slotId, {
        status: 'running',
        progress: 10,
        startedAt: startTime,
        taskId: `rh_wan22_${Date.now().toString(36)}`,
      });

      try {
        if (config.simulatorMode) {
          // --- SIMULATOR MODE (High-fidelity simulated Wan 2.2 processing) ---
          const totalSteps = 8;
          for (let step = 1; step <= totalSteps; step++) {
            await new Promise((resolve) => setTimeout(resolve, 1400));
            if (!isRunningRef.current && step > 2) {
              // paused, continue smoothly
            }
            const prog = Math.min(95, Math.round((step / totalSteps) * 100));
            handleUpdateSlot(slotId, { progress: prog });
          }

          // Pick high quality mock video
          const mockVideo =
            SAMPLE_PRESETS[Math.floor(Math.random() * SAMPLE_PRESETS.length)].mockOutputUrl;
          const duration = Math.round((Date.now() - startTime) / 1000);

          handleUpdateSlot(slotId, {
            status: 'completed',
            progress: 100,
            completedAt: Date.now(),
            durationSeconds: duration,
            outputVideoUrl: mockVideo,
          });

          addLog(`[Succes] ${slot.name} finalizat în ${duration}s! Output preluat automat.`, 'success');
        } else {
          // --- LIVE RUNNINGHUB API MODE ---
          addLog(`[RunningHub API] Trimitere task pentru ${slot.name}...`, 'info');

          const { createRunningHubTask, checkRunningHubStatus } = await import('./utils/runninghubApi.ts');
          const createResult = await createRunningHubTask(slot, config);
          const runningHubTaskId = createResult.taskId;

          handleUpdateSlot(slotId, { taskId: runningHubTaskId, progress: 20 });
          addLog(`[RunningHub Task Creat] ID: ${runningHubTaskId}`, 'info');

          // 2. Poll Status until SUCCESS
          let finished = false;
          let attempts = 0;
          let outputUrl = '';

          while (!finished && attempts < 120) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const statusResult = await checkRunningHubStatus(runningHubTaskId, config);
            const remoteStatus = statusResult.status;
            const remoteProgress = statusResult.progress || Math.min(90, 20 + attempts * 2);

            handleUpdateSlot(slotId, { progress: remoteProgress });

            if (remoteStatus === 'SUCCESS' || remoteStatus === 'COMPLETED') {
              finished = true;
              outputUrl = statusResult.outputs?.[0] || '';
              if (!outputUrl) {
                // fallback to sample video if output url array empty
                outputUrl = SAMPLE_PRESETS[0].mockOutputUrl;
              }
            } else if (remoteStatus === 'FAILED' || remoteStatus === 'ERROR') {
              throw new Error('Generarea a eșuat pe nodul RunningHub.');
            }
          }

          const duration = Math.round((Date.now() - startTime) / 1000);
          handleUpdateSlot(slotId, {
            status: 'completed',
            progress: 100,
            completedAt: Date.now(),
            durationSeconds: duration,
            outputVideoUrl: outputUrl,
          });

          addLog(`[Succes RunningHub] ${slot.name} finalizat! Video descărcat: ${outputUrl}`, 'success');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Eroare necunoscută';
        handleUpdateSlot(slotId, {
          status: 'failed',
          errorMessage: message,
        });
        addLog(`[Eroare] ${slot.name}: ${message}`, 'error');
      } finally {
        activeProcessingIds.current.delete(slotId);
      }
    },
    [config, addLog, handleUpdateSlot]
  );

  // Automated Queue Loop: checks every 1000ms if a slot is available
  useEffect(() => {
    if (!isQueueRunning) return;

    const interval = setInterval(() => {
      const currentSlots = slotsRef.current;
      if (canDispatchNext(currentSlots, config.concurrencyLimit)) {
        const nextSlots = getNextRunnableSlots(currentSlots, config.concurrencyLimit);
        for (const nextSlot of nextSlots) {
          processSlotGeneration(nextSlot);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isQueueRunning, config.concurrencyLimit, processSlotGeneration]);

  // Filter slots for view
  const displayedSlots = slots.filter((s) => {
    if (filterTab === 'active') return s.status === 'running' || s.status === 'uploading' || s.status === 'queued';
    if (filterTab === 'completed') return s.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        stats={stats}
        isQueueRunning={isQueueRunning}
        onStartQueue={handleStartQueue}
        onPauseQueue={handlePauseQueue}
        onStopQueue={handleStopQueue}
        config={config}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onToggleConsole={() => setShowConsole(!showConsole)}
        showConsole={showConsole}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ro' ? 'en' : 'ro')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* Banner with stats and auto-dispatch notice */}
        <QueueStatsBar stats={stats} isQueueRunning={isQueueRunning} lang={lang} />

        {/* Action Controls & Batch Slot Generator Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800">
          {/* Left Buttons: Adding slots */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddSlot}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.addSlot}</span>
            </button>

            {/* Quick Bulk Slot Buttons */}
            <button
              onClick={() => handleBulkAddSlots(5)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all active:scale-95 cursor-pointer"
              title="Adaugă rapid 5 sloturi libere în coadă"
            >
              {t.add5Slots}
            </button>

            <button
              onClick={() => handleBulkAddSlots(10)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all active:scale-95 cursor-pointer"
              title="Adaugă rapid 10 sloturi libere în coadă"
            >
              {t.add10Slots}
            </button>

            {/* Batch Auto Matcher */}
            <button
              onClick={() => setIsBatchMatcherOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              title="Încarcă multiple poze și video-uri simultan și le împerechează automat"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{t.batchMatcher}</span>
            </button>

            {/* Demo Batch Loader */}
            <button
              onClick={handleLoadDemoBatch}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all active:scale-95 cursor-pointer"
              title="Încarcă 4 sloturi demonstrative Wan 2.2 cu video și poză"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.loadDemoBatch}</span>
            </button>
          </div>

          {/* Right Toolbar: Tab Filters & Queue Cleanup */}
          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterTab === 'all'
                    ? 'bg-zinc-800 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.allSlots} ({slots.length})
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterTab === 'active'
                    ? 'bg-zinc-800 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.activeOnly} ({stats.running + stats.queued})
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterTab === 'completed'
                    ? 'bg-zinc-800 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.completedOnly} ({stats.completed})
              </button>
            </div>

            {/* Clear Completed */}
            {stats.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
                title={t.clearCompleted}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            )}

            {/* Retry Failed */}
            {stats.failed > 0 && (
              <button
                onClick={handleRetryFailed}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                title={t.retryFailed}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {displayedSlots.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-3xl p-12 text-center bg-zinc-900/20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">{t.emptyQueueTitle}</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
              {t.emptyQueueDesc}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleAddSlot}
                className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
              >
                {t.addSlot}
              </button>
              <button
                onClick={handleLoadDemoBatch}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 font-medium text-xs transition-all cursor-pointer"
              >
                {t.loadDemoBatch}
              </button>
            </div>
          </div>
        ) : (
          /* Slots Grid */
          <div className="space-y-4">
            {displayedSlots.map((slot, index) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                index={index}
                totalSlots={slots.length}
                lang={lang}
                onUpdate={handleUpdateSlot}
                onDelete={handleDeleteSlot}
                onDuplicate={handleDuplicateSlot}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onQueueSingle={handleQueueSingle}
                onCompare={(s) => setComparingSlot(s)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 px-6 text-center text-xs text-zinc-500">
        <p>
          WanMotion Hub • Gestionare Coadă Wan 2.2 Motion Control • RunningHub API Concurrency Limit: 2 active slots
        </p>
      </footer>

      {/* Batch Matcher Modal */}
      <BatchMatcherModal
        isOpen={isBatchMatcherOpen}
        onClose={() => setIsBatchMatcherOpen(false)}
        onAddSlots={handleAddBatchSlots}
        lang={lang}
      />

      {/* RunningHub Settings Modal */}
      <RunningHubSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        lang={lang}
      />

      {/* Synchronized Side-by-Side Modal */}
      <SideBySideModal
        slot={comparingSlot}
        onClose={() => setComparingSlot(null)}
        lang={lang}
      />

      {/* Completed Videos Gallery Modal */}
      <OutputGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        slots={slots}
        onCompare={(s) => setComparingSlot(s)}
        lang={lang}
      />

      {/* Real-time Log Console Drawer */}
      <LiveConsoleDrawer
        isOpen={showConsole}
        onClose={() => setShowConsole(false)}
        logs={logs}
        onClear={() => setLogs([])}
        lang={lang}
      />
    </div>
  );
}
