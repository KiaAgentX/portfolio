import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleGenerate, handleGenerateJson } from './src/api-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Port 3000 is the only externally accessible port required by the build system
const PORT = process.env.PORT || 3000;

// API Endpoints
app.post('/api/generate', async (req, res) => {
  try {
    const result = await handleGenerate(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.post('/api/generate-json', async (req, res) => {
  try {
    const result = await handleGenerateJson(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Serve frontend assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
