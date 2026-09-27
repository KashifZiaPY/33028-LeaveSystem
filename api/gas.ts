export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const raw = process.env.VITE_API_ENDPOINT;
  const endpoint =
    raw && raw.startsWith('http')
      ? raw
      : 'https://script.google.com/macros/s/AKfycbwOFYdJB_DWZFpKkFh7DxERzmkGNREZuBhyCptqTf7-c8vD0zLI1CGeA-fiSRQ-xo94/exec';

  try {
    const response = await fetch(endpoint, {
      method: req.method || 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
