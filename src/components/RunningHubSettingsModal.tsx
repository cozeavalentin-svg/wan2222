import React, { useState } from 'react';
import { X, Key, Zap, Check, AlertCircle, Eye, EyeOff, Server, HelpCircle, Layers } from 'lucide-react';
import { RunningHubConfig } from '../types.ts';
import { Language, translations } from '../utils/translations.ts';

interface RunningHubSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RunningHubConfig;
  onSave: (config: RunningHubConfig) => void;
  lang: Language;
}

export const RunningHubSettingsModal: React.FC<RunningHubSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  lang,
}) => {
  const t = translations[lang];

  const [formConfig, setFormConfig] = useState<RunningHubConfig>({ ...config });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      if (formConfig.simulatorMode) {
        setTimeout(() => {
          setIsTesting(false);
          setTestResult({
            success: true,
            message: 'Simulator activ: Generare Wan 2.2 emulată perfect cu 2 sloturi paralele!',
          });
        }, 600);
        return;
      }

      const res = await fetch('/api/runninghub/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: formConfig.apiKey,
          baseUrl: formConfig.baseUrl,
        }),
      });

      const data = await res.json();
      if (data.code === 0 || res.ok) {
        setTestResult({
          success: true,
          message: `${t.connectionSuccess} (${data.msg || 'Conectat'})`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.msg || t.connectionError,
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Eroare de rețea',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.settings}</h2>
              <p className="text-xs text-zinc-400">Configurare API RunningHub & Wan 2.2 Workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Simulator vs Live Switch */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {formConfig.simulatorMode ? t.simulatorMode : t.liveApiMode}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    formConfig.simulatorMode
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-800'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {formConfig.simulatorMode ? 'Demo / Simulator' : 'Live RunningHub'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {formConfig.simulatorMode
                  ? 'Permite testarea întregului flux cu 2 sloturi simultan și descărcarea rezultatelor demonstrative Wan 2.2 fără a consuma credite RunningHub.'
                  : 'Trimite apelurile direct la RunningHub API utilizând cheia dvs. și workflow-ul specificat.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={!formConfig.simulatorMode}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, simulatorMode: !e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* RunningHub API Key */}
          <div>
            <label className="text-xs font-semibold text-zinc-200 block mb-1">
              {t.apiKeyLabel}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formConfig.apiKey}
                onChange={(e) => setFormConfig({ ...formConfig, apiKey: e.target.value })}
                placeholder="Ex: 8f9b7c6a5e4d3c2b1a0f9e8d7c6b5a4f"
                className="w-full text-xs font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 pl-3 pr-10 py-2.5 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Găsești cheia API în contul RunningHub: Profil → Personal Center → OpenAPI / API Key.
            </p>
          </div>

          {/* Workflow ID */}
          <div>
            <label className="text-xs font-semibold text-zinc-200 block mb-1">
              {t.workflowIdLabel}
            </label>
            <input
              type="text"
              value={formConfig.workflowId}
              onChange={(e) => setFormConfig({ ...formConfig, workflowId: e.target.value })}
              placeholder="Ex: 189283749201948576"
              className="w-full text-xs font-mono rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              ID-ul workflow-ului ComfyUI cu Wan 2.2 Motion Control publicat sau salvat în contul tău RunningHub.
            </p>
          </div>

          {/* Concurrency Limit (2 concurrent slots) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-200">
                {t.concurrencyLabel}
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {formConfig.concurrencyLimit} sloturi simultan
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={formConfig.concurrencyLimit}
              onChange={(e) =>
                setFormConfig({ ...formConfig, concurrencyLimit: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>1 Slot</span>
              <span className="text-amber-400 font-semibold">2 Sloturi (Standard RunningHub)</span>
              <span>3 Sloturi</span>
              <span>4 Sloturi</span>
            </div>
          </div>

          {/* ComfyUI Node Mappings */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-3">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Mapare Noduri ComfyUI Wan 2.2
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  {t.imageNodeIdLabel}
                </label>
                <input
                  type="text"
                  value={formConfig.imageNodeId}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, imageNodeId: e.target.value })
                  }
                  placeholder="12"
                  className="w-full text-xs font-mono rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  {t.videoNodeIdLabel}
                </label>
                <input
                  type="text"
                  value={formConfig.videoNodeId}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, videoNodeId: e.target.value })
                  }
                  placeholder="15"
                  className="w-full text-xs font-mono rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTesting ? 'Se verifică...' : t.testConnection}</span>
            </button>

            {testResult && (
              <div
                className={`mt-2 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.saveSettings}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
