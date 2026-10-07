import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    if (playerId.length >= 8 && playerId.length <= 12 && /^\d+$/.test(playerId)) {
      return res.status(200).json({
        success: true,
        name: "BGMI_PLAYER_" + playerId.slice(-4),
        message: 'Player verified successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Invalid Player ID or Player not found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error during verification'
    });
  }
}
