import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';



// Sightengine AI moderation helper with automatic fallback & quota-cooldown handling
let sightengineDisabledUntil = 0;

async function checkSightengine(imageUrl: string): Promise<number | null> {
  const apiUser = process.env.SIGHTENGINE_API_USER || '1582080034';
  const apiSecret = process.env.SIGHTENGINE_API_SECRET || 'px52hyRuYyDegSe2vMqRmcCT4x4R7yAp';
  if (!apiUser || !apiSecret) return null;

  // Agar quota exhaust ya rate limit ho gaya ho, toh directly fallback (Imagga) par switch karo
  if (Date.now() < sightengineDisabledUntil) {
    return null;
  }

  try {
    const url = `https://api.sightengine.com/1.0/check.json?models=nudity-2.1&url=${encodeURIComponent(imageUrl)}&api_user=${encodeURIComponent(apiUser)}&api_secret=${encodeURIComponent(apiSecret)}`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429 || response.status === 402 || response.status === 403) {
        // Quota ya rate limit hit: 5 minute ke liye Imagga ko primary banao
        sightengineDisabledUntil = Date.now() + 5 * 60 * 1000;
        console.warn(`Sightengine limit hit (${response.status}), switching to Imagga fallback.`);
      }
      return null;
    }
    const data = await response.json();
    if (data.status !== 'success' || !data.nudity) {
      if (data.error && (data.error.code === 103 || data.error.code === 104)) {
        sightengineDisabledUntil = Date.now() + 10 * 60 * 1000;
        console.warn('Sightengine monthly limit exhausted, falling back to Imagga.');
      }
      return null;
    }
    const n = data.nudity;
    // Calculate 0-100 score based on nudity & suggestive probabilities
    const score = Math.round(
      Math.max(
        (n.sexual_activity || 0) * 100,
        (n.sexual_display || 0) * 100,
        (n.erotica || 0) * 95,
        (n.very_suggestive || 0) * 75,
        (n.suggestive || 0) * 50
      )
    );
    return Math.min(100, Math.max(0, score));
  } catch (err) {
    console.warn('Sightengine request failed, falling back to Imagga:', err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In-memory cache for NSFW scores (0 - 100)
  const nsfwScoreCache = new Map<string, number>();

  // Simple sequential queue to respect Imagga free-tier concurrency limits (max 1 concurrent)
  class RequestQueue {
    private queue: (() => Promise<void>)[] = [];
    private running = false;

    push<T>(task: () => Promise<T>): Promise<T> {
      return new Promise((resolve) => {
        this.queue.push(async () => {
          try {
            const res = await task();
            resolve(res);
          } catch {
            resolve(0 as unknown as T);
          }
        });
        this.process();
      });
    }

    private async process() {
      if (this.running || this.queue.length === 0) return;
      this.running = true;
      while (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) {
          await next();
          // Small delay between requests to avoid rate limits
          await new Promise((r) => setTimeout(r, 120));
        }
      }
      this.running = false;
    }
  }

  const imaggaQueue = new RequestQueue();
  
  // Image proxy to bypass ISP blocks on TMDB images (e.g. Jio)
  app.get('/api/image-proxy', async (req, res) => {
    const tmdbPath = req.query.path as string;
    if (!tmdbPath) {
      return res.status(400).send('Missing path');
    }

    try {
      const tmdbUrl = `https://image.tmdb.org/t/p${tmdbPath.startsWith('/') ? '' : '/'}${tmdbPath}`;
      const response = await fetch(tmdbUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).send('Error fetching image');
      }

      const contentType = response.headers.get('content-type');
      if (contentType) res.set('Content-Type', contentType);
      const cacheControl = response.headers.get('cache-control');
      if (cacheControl) res.set('Cache-Control', cacheControl);
      else res.set('Cache-Control', 'public, max-age=31536000');
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error('Image proxy error:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/nsfw', async (req, res) => {
    const imageUrl = req.query.url as string;
    const threshold = parseInt(req.query.threshold as string, 10) || 50;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing image URL' });
    }
    
    // Return cached result if available to save API quota
    if (nsfwScoreCache.has(imageUrl)) {
      const score = nsfwScoreCache.get(imageUrl)!;
      const isNSFW = threshold < 100 && score >= threshold;
      return res.json({ nsfwScore: score, isNSFW });
    }

    // 1. Try Sightengine first if credentials are configured
    const sightengineScore = await checkSightengine(imageUrl);
    if (sightengineScore !== null) {
      nsfwScoreCache.set(imageUrl, sightengineScore);
      const isNSFW = threshold < 100 && sightengineScore >= threshold;
      return res.json({ nsfwScore: sightengineScore, isNSFW, engine: 'sightengine' });
    }
    
    // 2. Fallback to Imagga (processed via queue to prevent concurrent request limit errors)
    const nsfwScore = await imaggaQueue.push(async () => {
      try {
        const apiKey = process.env.IMAGGA_API_KEY || 'acc_3814e39dbf950d6';
        const apiSecret = process.env.IMAGGA_API_SECRET || '72c6bdd559cbc4619c0b4504cca8d120';
        const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        
        const response = await fetch(`https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`, {
          headers: {
            'Authorization': authHeader
          }
        });
        
        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        
        // Category 1: Explicit Nudity / Porn / Erotica / Sex / Cleavage / Breasts (Weight 1.5)
        const explicitKeywords = [
          'nsfw', 'nude', 'nudity', 'naked', 'erotica', 'porn', 'pornography',
          'explicit', 'intercourse', 'sexual intercourse', 'cleavage', 'breasts', 'boobs'
        ];
        // Category 2: Suggestive / Sensual / Intimate / Erotic (Weight 1.1)
        const suggestiveKeywords = [
          'lingerie', 'underwear', 'bikini', 'swimsuit', 'erotic', 'sensual',
          'sensuality', 'seductive', 'sexy', 'provocative', 'alluring', 'hot'
        ];
        
        let calculatedScore = 0;
        if (data && data.result && data.result.tags) {
          for (const tagObj of data.result.tags) {
            const tagName = tagObj.tag.en.toLowerCase();
            const conf = tagObj.confidence || 0;
            if (explicitKeywords.includes(tagName)) {
              calculatedScore = Math.max(calculatedScore, conf * 1.5);
            } else if (suggestiveKeywords.includes(tagName)) {
              calculatedScore = Math.max(calculatedScore, conf * 1.1);
            }
          }
        }
        
        return Math.min(100, Math.round(calculatedScore));
      } catch {
        return null;
      }
    });

    if (nsfwScore === null) {
      return res.json({ nsfwScore: 0, isNSFW: false });
    }

    nsfwScoreCache.set(imageUrl, nsfwScore);
    const isNSFW = threshold < 100 && nsfwScore >= threshold;
    res.json({ nsfwScore, isNSFW });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
