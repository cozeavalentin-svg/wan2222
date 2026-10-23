import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSlot,
  getRunningCount,
  canDispatchNext,
  getNextRunnableSlots,
  updateSlot,
  calculateQueueStats,
  autoMatchPairs,
  buildRunningHubPayload,
} from './queueEngine.ts';
import { Slot, RunningHubConfig } from '../types.ts';

test('createSlot initializes slot with valid default settings', () => {
  const slot = createSlot(0);
  assert.equal(slot.name, 'Slot #1');
  assert.equal(slot.status, 'idle');
  assert.equal(slot.progress, 0);
  assert.ok(slot.settings.prompt.length > 0);
  assert.equal(slot.settings.resolution, '720p');
  assert.equal(slot.settings.motionStrength, 1.0);
});

test('concurrency limits: canDispatchNext respects maxConcurrency = 2', () => {
  const slot1: Slot = { ...createSlot(0), status: 'running' };
  const slot2: Slot = { ...createSlot(1), status: 'queued' };
  const slot3: Slot = { ...createSlot(2), status: 'queued' };

  // 1 running, 2 queued -> can dispatch 1 more
  assert.equal(canDispatchNext([slot1, slot2, slot3], 2), true);
  assert.equal(getRunningCount([slot1, slot2, slot3]), 1);

  const nextToRun = getNextRunnableSlots([slot1, slot2, slot3], 2);
  assert.equal(nextToRun.length, 1);
  assert.equal(nextToRun[0].id, slot2.id);

  // If 2 are running -> can NOT dispatch next
  const slot4: Slot = { ...createSlot(3), status: 'running' };
  assert.equal(canDispatchNext([slot1, slot4, slot2, slot3], 2), false);
  assert.equal(getNextRunnableSlots([slot1, slot4, slot2, slot3], 2).length, 0);
});

test('updateSlot updates target slot without mutating others', () => {
  const slot1 = createSlot(0);
  const slot2 = createSlot(1);
  const updated = updateSlot([slot1, slot2], slot1.id, { status: 'completed', progress: 100 });

  assert.equal(updated[0].status, 'completed');
  assert.equal(updated[0].progress, 100);
  assert.equal(updated[1].status, 'idle');
});

test('calculateQueueStats aggregates counts accurately', () => {
  const slots: Slot[] = [
    { ...createSlot(0), status: 'idle' },
    { ...createSlot(1), status: 'queued' },
    { ...createSlot(2), status: 'running' },
    { ...createSlot(3), status: 'running' },
    { ...createSlot(4), status: 'completed', durationSeconds: 45 },
    { ...createSlot(5), status: 'completed', durationSeconds: 55 },
    { ...createSlot(6), status: 'failed' },
  ];

  const stats = calculateQueueStats(slots, 2);
  assert.equal(stats.total, 7);
  assert.equal(stats.idle, 1);
  assert.equal(stats.queued, 1);
  assert.equal(stats.running, 2);
  assert.equal(stats.completed, 2);
  assert.equal(stats.failed, 1);
  assert.equal(stats.activeConcurrency, 2);
  assert.equal(stats.totalDurationSeconds, 100);
});

test('autoMatchPairs matches base filenames intelligently', () => {
  const images = ['dancer_a.png', 'model_b.jpg', 'jump.webp'];
  const videos = ['dancer_a.mp4', 'different_name.mov', 'jump.mp4'];

  const matched = autoMatchPairs(images, videos);
  assert.equal(matched.length, 3);

  // Exact base name matches should pair first
  const matchA = matched.find((m) => m.imageName === 'dancer_a.png');
  assert.ok(matchA);
  assert.equal(matchA.videoName, 'dancer_a.mp4');

  const matchJump = matched.find((m) => m.imageName === 'jump.webp');
  assert.ok(matchJump);
  assert.equal(matchJump.videoName, 'jump.mp4');

  // Fallback sequential match
  const matchB = matched.find((m) => m.imageName === 'model_b.jpg');
  assert.ok(matchB);
  assert.equal(matchB.videoName, 'different_name.mov');
});

test('buildRunningHubPayload formats parameters according to RunningHub OpenAPI requirements', () => {
  const slot: Slot = {
    ...createSlot(0),
    imageUrl: 'https://example.com/ref.png',
    videoUrl: 'https://example.com/motion.mp4',
  };
  const config: RunningHubConfig = {
    apiKey: 'test_api_key_123',
    workflowId: 'wf_wan22_motion_998',
    imageNodeId: '12',
    imageFieldName: 'image',
    videoNodeId: '15',
    videoFieldName: 'video',
    promptNodeId: '6',
    promptFieldName: 'text',
    baseUrl: 'https://www.runninghub.ai',
    concurrencyLimit: 2,
    simulatorMode: false,
  };

  const payload = buildRunningHubPayload(slot, config) as {
    apiKey: string;
    workflowId: string;
    nodeParamList: Array<{ nodeId: string; fieldName: string; fieldValue: string }>;
  };

  assert.equal(payload.apiKey, 'test_api_key_123');
  assert.equal(payload.workflowId, 'wf_wan22_motion_998');
  assert.equal(payload.nodeParamList.length, 3);
  assert.equal(payload.nodeParamList[0].fieldValue, 'https://example.com/ref.png');
  assert.equal(payload.nodeParamList[1].fieldValue, 'https://example.com/motion.mp4');
});
