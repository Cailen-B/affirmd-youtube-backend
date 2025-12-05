// api/youtube-audio.js - Vercel serverless function to extract YouTube audio stream URL
import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.body;
  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId' });
  }

  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    if (!audioFormat) {
      throw new Error('No audio format found');
    }

    res.status(200).json({ audioUrl: audioFormat.url, title: info.videoDetails.title });
  } catch (error) {
    console.error('ytdl Error:', error);
    res.status(500).json({ error: 'Failed to extract audio: ' + error.message });
  }
}
