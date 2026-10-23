import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // --- RunningHub API Proxy Routes ---

  // Create Task
  app.post('/api/runninghub/create-task', async (req, res) => {
    try {
      const { apiKey, workflowId, nodeParamList, baseUrl = 'https://www.runninghub.ai' } = req.body;

      if (!apiKey || !workflowId) {
        return res.status(400).json({ code: 400, msg: 'API Key and Workflow ID are required' });
      }

      const apiUrl = `${baseUrl.replace(/\/+$/, '')}/task/openapi/create`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WanMotionHub/1.0',
        },
        body: JSON.stringify({
          apiKey,
          workflowId,
          nodeParamList: nodeParamList || [],
        }),
      });

      const data = await response.json();
      return res.json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown server error';
      console.error('RunningHub create-task proxy error:', message);
      return res.status(500).json({ code: 500, msg: `Proxy error: ${message}` });
    }
  });

  // Query Task Status & Outputs
  app.post('/api/runninghub/task-status', async (req, res) => {
    try {
      const { apiKey, taskId, baseUrl = 'https://www.runninghub.ai' } = req.body;

      if (!apiKey || !taskId) {
        return res.status(400).json({ code: 400, msg: 'API Key and Task ID are required' });
      }

      // First query status
      const statusUrl = `${baseUrl.replace(/\/+$/, '')}/task/openapi/status`;
      const statusResponse = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WanMotionHub/1.0',
        },
        body: JSON.stringify({ apiKey, taskId }),
      });

      const statusData = (await statusResponse.json()) as {
        code?: number;
        msg?: string;
        data?: { status?: string; progress?: number };
      };

      // Also try outputs endpoint if status endpoint doesn't return fileUrlList
      let fileUrlList: string[] = [];
      const outputsUrl = `${baseUrl.replace(/\/+$/, '')}/task/openapi/outputs`;
      try {
        const outRes = await fetch(outputsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WanMotionHub/1.0',
          },
          body: JSON.stringify({ apiKey, taskId }),
        });
        const outData = (await outRes.json()) as {
          data?: Array<{ fileUrl?: string }> | { fileUrlList?: string[] };
        };
        if (Array.isArray(outData.data)) {
          fileUrlList = outData.data.map((item) => item.fileUrl).filter(Boolean) as string[];
        } else if (outData.data && Array.isArray((outData.data as { fileUrlList?: string[] }).fileUrlList)) {
          fileUrlList = (outData.data as { fileUrlList: string[] }).fileUrlList;
        }
      } catch {
        // Fallback: fileUrlList remains empty
      }

      return res.json({
        ...statusData,
        outputs: fileUrlList,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown server error';
      console.error('RunningHub task-status proxy error:', message);
      return res.status(500).json({ code: 500, msg: `Proxy error: ${message}` });
    }
  });

  // Test RunningHub Connection & Account info
  app.post('/api/runninghub/test-connection', async (req, res) => {
    try {
      const { apiKey, baseUrl = 'https://www.runninghub.ai' } = req.body;
      if (!apiKey) {
        return res.status(400).json({ code: 400, msg: 'API Key is required' });
      }

      // Try calling status with dummy or account endpoint
      const accountUrl = `${baseUrl.replace(/\/+$/, '')}/uc/openapi/accountInfo`;
      try {
        const resp = await fetch(accountUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });
        const data = await resp.json();
        return res.json(data);
      } catch {
        // If account endpoint is not supported, return ok acknowledgement
        return res.json({ code: 0, msg: 'RunningHub endpoint reachable' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown server error';
      return res.status(500).json({ code: 500, msg: message });
    }
  });

  // Mount Vite middlewares in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WanMotion Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
