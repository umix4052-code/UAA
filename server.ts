import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));

  // Diagnostics endpoint
  app.get('/api/dns-diagnostics', async (req, res) => {
    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      env: {
        HTTP_PROXY: process.env.HTTP_PROXY || null,
        HTTPS_PROXY: process.env.HTTPS_PROXY || null,
        NODE_ENV: process.env.NODE_ENV || null
      }
    };
    res.json(results);
  });

  // Custom Router Proxy (CORS Fix)
  app.post('/api/custom-router', async (req, res) => {
    try {
      const { baseUrl, apiKey, ...payload } = req.body;
      if (!baseUrl || !apiKey || !payload.model) {
        return res.status(400).json({ error: 'Missing required fields: baseUrl, apiKey, or model' });
      }

      const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      const endpoint = cleanBaseUrl.endsWith('/chat/completions') ? cleanBaseUrl : cleanBaseUrl + '/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'HTTP-Referer': 'https://ultimate-ai-automationer.local',
          'X-Title': 'Ultimate AI Automationer',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return res.status(response.status).json({ 
          error: errorData || { message: `HTTP ${response.status}: ${response.statusText}` }
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Custom Router Proxy Error:', error);
      res.status(500).json({ error: { message: error.message || 'Internal Server Error' } });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
