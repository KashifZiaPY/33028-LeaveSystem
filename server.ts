import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwOFYdJB_DWZFpKkFh7DxERzmkGNREZuBhyCptqTf7-c8vD0zLI1CGeA-fiSRQ-xo94/exec';

function getGoogleScriptUrl(): string {
  const val = process.env.VITE_API_ENDPOINT;
  if (val && val.startsWith('http')) {
    return val;
  }
  return DEFAULT_GOOGLE_SCRIPT_URL;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Proxy endpoint to communicate directly with Google Apps Script Web App without browser CORS
  app.post('/api/gas', async (req, res) => {
    try {
      const targetUrl = getGoogleScriptUrl();
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(req.body),
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch {
        return res.status(502).json({ ok: false, error: 'Google Apps Script returned non-JSON response.' });
      }
    } catch (err: any) {
      console.error('[API Proxy Error]', err);
      return res.status(500).json({ ok: false, error: err.message || 'Backend proxy connection failed' });
    }
  });

  app.get('/api/gas', async (req, res) => {
    try {
      const response = await fetch(getGoogleScriptUrl(), { method: 'GET' });
      const text = await response.text();
      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LMS Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
