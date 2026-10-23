export type SlotStatus = 'idle' | 'queued' | 'uploading' | 'running' | 'completed' | 'failed' | 'paused';

export interface WanSettings {
  prompt: string;
  negativePrompt?: string;
  motionStrength: number; // e.g. 1.0 (0.1 to 2.0)
  steps: number; // e.g. 30
  cfgScale: number; // e.g. 6.0
  resolution: '720p' | '480p' | '1080p';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  seed: number;
  randomizeSeed: boolean;
}

export interface Slot {
  id: string;
  name: string;
  createdAt: number;
  imageFile?: File | null;
  imageUrl?: string;
  imageName?: string;
  videoFile?: File | null;
  videoUrl?: string;
  videoName?: string;
  settings: WanSettings;
  status: SlotStatus;
  progress: number; // 0 - 100
  taskId?: string;
  startedAt?: number;
  completedAt?: number;
  durationSeconds?: number;
  outputVideoUrl?: string;
  errorMessage?: string;
}

export interface RunningHubConfig {
  apiKey: string;
  workflowId: string;
  imageNodeId: string;
  imageFieldName: string;
  videoNodeId: string;
  videoFieldName: string;
  promptNodeId: string;
  promptFieldName: string;
  baseUrl: string;
  concurrencyLimit: number; // default 2
  simulatorMode: boolean;
}

export interface QueueStats {
  total: number;
  idle: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  activeConcurrency: number;
  maxConcurrency: number;
  totalDurationSeconds: number;
}
