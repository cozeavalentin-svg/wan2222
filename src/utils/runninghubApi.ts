import { RunningHubConfig, Slot } from '../types.ts';
import { buildRunningHubPayload } from './queueEngine.ts';

export interface CreateTaskResult {
  taskId: string;
}

export interface TaskStatusResult {
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | string;
  progress: number;
  outputs: string[];
}

/**
 * Universal RunningHub API Client
 * Works both with local Express backend and statically on GitHub Pages / Vercel.
 */
export async function createRunningHubTask(
  slot: Slot,
  config: RunningHubConfig
): Promise<CreateTaskResult> {
  const payload = buildRunningHubPayload(slot, config) as {
    apiKey: string;
    workflowId: string;
    nodeParamList: Array<{ nodeId: string; fieldName: string; fieldValue: string | number }>;
  };

  // Try backend proxy route first
  try {
    const res = await fetch('/api/runninghub/create-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        workflowId: config.workflowId,
        nodeParamList: payload.nodeParamList,
        baseUrl: config.baseUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.code === 0 && data.data?.taskId) {
        return { taskId: data.data.taskId };
      }
      if (data.msg) {
        throw new Error(data.msg);
      }
    }
  } catch (backendErr) {
    // If backend proxy is not found (e.g. static GitHub Pages), fall back to direct / CORS proxy call
    console.warn('Backend proxy unavailable, attempting direct/proxy call...', backendErr);
  }

  // Fallback for static GitHub Pages hosting:
  // Direct call to RunningHub or through CORS proxy
  const rawTargetUrl = `${(config.baseUrl || 'https://www.runninghub.ai').replace(/\/+$/, '')}/task/openapi/create`;
  
  // If user configured a CORS proxy or is running on GitHub Pages
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const targetUrl = isGitHubPages ? `https://corsproxy.io/?url=${encodeURIComponent(rawTargetUrl)}` : rawTargetUrl;

  const directRes = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: config.apiKey,
      workflowId: config.workflowId,
      nodeParamList: payload.nodeParamList,
    }),
  });

  const directData = await directRes.json();
  if (directData.code === 0 && directData.data?.taskId) {
    return { taskId: directData.data.taskId };
  }
  throw new Error(directData.msg || 'Eroare la crearea task-ului RunningHub');
}

export async function checkRunningHubStatus(
  taskId: string,
  config: RunningHubConfig
): Promise<TaskStatusResult> {
  // Try backend proxy route first
  try {
    const res = await fetch('/api/runninghub/task-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        taskId,
        baseUrl: config.baseUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        status: data.data?.status || 'RUNNING',
        progress: data.data?.progress || 0,
        outputs: data.outputs || [],
      };
    }
  } catch {
    // Fallback for GitHub Pages static host
  }

  // Fallback for static GitHub Pages
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const rawStatusUrl = `${(config.baseUrl || 'https://www.runninghub.ai').replace(/\/+$/, '')}/task/openapi/status`;
  const statusUrl = isGitHubPages ? `https://corsproxy.io/?url=${encodeURIComponent(rawStatusUrl)}` : rawStatusUrl;

  const statusRes = await fetch(statusUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: config.apiKey,
      taskId,
    }),
  });

  const statusData = await statusRes.json();

  let outputs: string[] = [];
  try {
    const rawOutUrl = `${(config.baseUrl || 'https://www.runninghub.ai').replace(/\/+$/, '')}/task/openapi/outputs`;
    const outUrl = isGitHubPages ? `https://corsproxy.io/?url=${encodeURIComponent(rawOutUrl)}` : rawOutUrl;
    const outRes = await fetch(outUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: config.apiKey,
        taskId,
      }),
    });
    const outData = await outRes.json();
    if (Array.isArray(outData.data)) {
      outputs = outData.data.map((item: { fileUrl?: string }) => item.fileUrl).filter(Boolean);
    }
  } catch {
    // fallback
  }

  return {
    status: statusData.data?.status || 'RUNNING',
    progress: statusData.data?.progress || 0,
    outputs,
  };
}
