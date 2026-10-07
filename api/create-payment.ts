import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const DIVINEPAY_CONFIG = {
  baseUrl: process.env.DIVINEPAY_PAYIN_URL || 'https://divinepay.us.cc/api/payin/payin/create',
  apiKey: process.env.DIVINEPAY_API_KEY || 'your_divinepay_secret_key_here',
};

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
    const { playerId, packageId, amount, price } = req.body;

    if (!playerId || !packageId || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const merchantOrderNo = `ES_${playerId}_${Date.now()}${randomSuffix}`;
    const paymentAmount = Number(price);

    const requestBody = {
      amount: paymentAmount,
      order_id: merchantOrderNo,
      playerId: playerId,
    };

    const response = await axios.post(DIVINEPAY_CONFIG.baseUrl, requestBody, {
      timeout: 15000,
      headers: {
        'x-api-key': DIVINEPAY_CONFIG.apiKey,
        'Authorization': `Bearer ${DIVINEPAY_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    const data = response.data;

    if (data && data.success === true && (data.data?.paymentUrl || data.paymentUrl || data.pay_url)) {
      const payUrl = data.data?.paymentUrl || data.paymentUrl || data.pay_url;
      const orderId = data.data?.order_id || data.order_id || merchantOrderNo;
      return res.status(200).json({
        success: true,
        paymentUrl: payUrl,
        orderId: orderId,
      });
    } else {
      return res.status(200).json({
        success: false,
        error: data?.message || 'Payment gateway returned an error.',
        orderId: merchantOrderNo
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'System error. Failed to create payment order.' });
  }
}
