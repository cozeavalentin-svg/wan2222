import { Slot, QueueStats, RunningHubConfig, WanSettings } from '../types.ts';

export function generateDefaultSettings(): WanSettings {
  return {
    prompt: 'Wan 2.2 motion control, fluid realistic human motion, high quality cinematic 4k photorealistic, seamless movement transfer',
    negativePrompt: 'distorted, jerky motion, artifacts, blurry, watermark, low quality, glitch',
    motionStrength: 1.0,
    steps: 30,
    cfgScale: 6.0,
    resolution: '720p',
    aspectRatio: '9:16',
    seed: Math.floor(Math.random() * 1000000),
    randomizeSeed: true,
  };
}

export function createSlot(index: number, partial?: Partial<Slot>): Slot {
  return {
    id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: `Slot #${index + 1}`,
    createdAt: Date.now(),
    status: 'idle',
    progress: 0,
    settings: generateDefaultSettings(),
    ...partial,
  };
}

export function getRunningCount(slots: Slot[]): number {
  return slots.filter((s) => s.status === 'running' || s.status === 'uploading').length;
}

export function canDispatchNext(slots: Slot[], maxConcurrency: number = 2): boolean {
  const activeCount = getRunningCount(slots);
  const hasQueued = slots.some((s) => s.status === 'queued');
  return activeCount < maxConcurrency && hasQueued;
}

export function getNextRunnableSlots(slots: Slot[], maxConcurrency: number = 2): Slot[] {
  const activeCount = getRunningCount(slots);
  const slotsAvailable = Math.max(0, maxConcurrency - activeCount);
  if (slotsAvailable <= 0) return [];

  const queued = slots.filter((s) => s.status === 'queued');
  return queued.slice(0, slotsAvailable);
}

export function updateSlot(slots: Slot[], slotId: string, updates: Partial<Slot>): Slot[] {
  return slots.map((s) => (s.id === slotId ? { ...s, ...updates } : s));
}

export function calculateQueueStats(slots: Slot[], maxConcurrency: number = 2): QueueStats {
  let idle = 0;
  let queued = 0;
  let running = 0;
  let completed = 0;
  let failed = 0;
  let totalDurationSeconds = 0;

  for (const s of slots) {
    if (s.status === 'idle') idle++;
    else if (s.status === 'queued') queued++;
    else if (s.status === 'running' || s.status === 'uploading') running++;
    else if (s.status === 'completed') {
      completed++;
      if (s.durationSeconds) totalDurationSeconds += s.durationSeconds;
    } else if (s.status === 'failed') failed++;
  }

  return {
    total: slots.length,
    idle,
    queued,
    running,
    completed,
    failed,
    activeConcurrency: running,
    maxConcurrency,
    totalDurationSeconds,
  };
}

/**
 * Smart matching algorithm:
 * Given a list of image filenames and video filenames,
 * matches them by base name without extension, e.g. "dance_01.png" with "dance_01.mp4".
 * If unmatched, pairs sequentially.
 */
export function autoMatchPairs(
  imageNames: string[],
  videoNames: string[]
): Array<{ imageName: string; videoName: string }> {
  const getBaseName = (filename: string) => {
    const dotIndex = filename.lastIndexOf('.');
    return (dotIndex > 0 ? filename.substring(0, dotIndex) : filename).toLowerCase().trim();
  };

  const results: Array<{ imageName: string; videoName: string }> = [];
  const usedVideos = new Set<string>();

  // 1. Direct base name matches
  for (const img of imageNames) {
    const base = getBaseName(img);
    const matchedVideo = videoNames.find((v) => !usedVideos.has(v) && getBaseName(v) === base);
    if (matchedVideo) {
      results.push({ imageName: img, videoName: matchedVideo });
      usedVideos.add(matchedVideo);
    }
  }

  // 2. Sequential fallback for remaining items
  const remainingImages = imageNames.filter((img) => !results.some((r) => r.imageName === img));
  const remainingVideos = videoNames.filter((v) => !usedVideos.has(v));

  const maxLen = Math.max(remainingImages.length, remainingVideos.length);
  for (let i = 0; i < maxLen; i++) {
    const img = remainingImages[i] || '';
    const vid = remainingVideos[i] || '';
    if (img || vid) {
      results.push({ imageName: img, videoName: vid });
    }
  }

  return results;
}

export function buildRunningHubPayload(slot: Slot, config: RunningHubConfig): Record<string, unknown> {
  const nodeParamList: Array<{ nodeId: string; fieldName: string; fieldValue: string | number }> = [
    {
      nodeId: config.imageNodeId || '12',
      fieldName: config.imageFieldName || 'image',
      fieldValue: slot.imageUrl || '',
    },
    {
      nodeId: config.videoNodeId || '15',
      fieldName: config.videoFieldName || 'video',
      fieldValue: slot.videoUrl || '',
    },
  ];

  if (config.promptNodeId) {
    nodeParamList.push({
      nodeId: config.promptNodeId,
      fieldName: config.promptFieldName || 'text',
      fieldValue: slot.settings.prompt,
    });
  }

  return {
    apiKey: config.apiKey,
    workflowId: config.workflowId,
    nodeParamList,
  };
}
