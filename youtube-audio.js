const ytdl = require('ytdl-core');
const cors = require('cors');

module.exports = async (req, res) => {
  // Vercel auto-adds CORS for you, but explicit for safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { videoId } = req.body;
    if (!videoId || typeof videoId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid videoId' });
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[YT-FETCH] Starting for videoId: ${videoId}`);

    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    });

    const title = info.videoDetails.title;
    const description = info.videoDetails.description || 'No description available.';

    console.log(`[YT-FETCH] Got title: ${title.substring(0, 50)}...`);

    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    if (audioFormats.length === 0) {
      throw new Error('No audio formats found (video may be restricted)');
    }

    const bestAudio = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
    const audioUrl = bestAudio.url;

    console.log(`[YT-SUCCESS] Audio URL length: ${audioUrl.length} chars`);

    res.status(200).json({ 
      audioUrl, 
      title, 
      description 
    });
  } catch (error) {
    console.error(`[YT-ERROR] ${error.message}\nStack: ${error.stack}`);
    res.status(500).json({ error: `Failed to fetch: ${error.message}` });
  }
};
