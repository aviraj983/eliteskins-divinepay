import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Verify BGMI Player ID using Rooter API (real in-game name lookup)
  app.post("/api/verify-player", async (req, res) => {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }

    if (!/^\d{8,12}$/.test(playerId)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid Player ID format. Must be 8-12 digits." 
      });
    }

    try {
      console.log(`[verify-player] Fetching real BGMI name for ID: ${playerId}`);
      
      const rooterResponse = await axios.get("https://www.rooter.gg/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html",
        },
        timeout: 10000,
      });

      const setCookies = rooterResponse.headers["set-cookie"];
      let accessToken = "";

      if (setCookies) {
        for (const cookie of setCookies) {
          if (cookie.includes("user_auth=")) {
            const match = cookie.match(/user_auth=([^;]+)/);
            if (match) {
              try {
                const decoded = decodeURIComponent(match[1]);
                const authData = JSON.parse(decoded);
                accessToken = authData.accessToken || "";
              } catch {}
            }
            if (accessToken) break;
          }
        }
      }

      if (!accessToken) {
        return res.status(502).json({ 
          success: false, 
          error: "Verification service temporarily unavailable. Please try again." 
        });
      }

      const usernameResponse = await axios.get(
        `https://bazaar.rooter.io/order/getUnipinUsername?gameCode=BGMI_IN&id=${playerId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Device-Type": "web",
            "App-Version": "1.0.0",
            "Device-Id": "eliteskins-verify",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
          },
          timeout: 10000,
        }
      );

      const data = usernameResponse.data;

      if (data.transaction === "SUCCESS" && data.unipinRes?.username) {
        res.json({ 
          success: true, 
          name: data.unipinRes.username,
          message: "ID Verified" 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          error: data.message || "Player not found. Please check the UID and try again." 
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: "Verification service error. Please try again." 
      });
    }
  });

  // Create Payment Order via Divine Pay Gateway
  app.post("/api/create-payment", async (req, res) => {
    const { playerId, packageId, amount, price, name, email, phone } = req.body;

    if (!playerId || !packageId || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const DIVINEPAY_CONFIG = {
        baseUrl: process.env.DIVINEPAY_PAYIN_URL || "https://divinepay.us.cc/api/payin/payin/create",
        apiKey: process.env.DIVINEPAY_API_KEY || "your_divinepay_secret_key_here",
      };

      const siteUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const callbackUrl = `${siteUrl}/api/payment-callback`;
      const merchantOrderNo = `ES_${playerId}_${Date.now()}`;
      const paymentAmount = Number(price);

      const requestBody = {
        amount: paymentAmount,
        order_id: merchantOrderNo,
        playerId: playerId,
        callback_url: callbackUrl,
      };

      const gatewayResponse = await axios.post(DIVINEPAY_CONFIG.baseUrl, requestBody, {
        headers: {
          "x-api-key": DIVINEPAY_CONFIG.apiKey,
          "Authorization": `Bearer ${DIVINEPAY_CONFIG.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      const data = gatewayResponse.data;

      if (data.success && (data.data?.paymentUrl || data.paymentUrl || data.pay_url || data.url)) {
        const payUrl = data.data?.paymentUrl || data.paymentUrl || data.pay_url || data.url;
        const orderId = data.data?.order_id || data.order_id || merchantOrderNo;
        res.json({
          success: true,
          paymentUrl: payUrl,
          orderId: orderId,
          method: "redirect",
        });
      } else {
        res.status(400).json({
          success: false,
          error: data.message || "Payment gateway temporarily unavailable. Please try again.",
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create payment order. Please try again." });
    }
  });

  // Submit UTR Endpoint for Divine Pay Manual Verification
  app.post("/api/submit-utr", async (req, res) => {
    const { order_id, orderId, utr } = req.body;
    const targetOrderId = order_id || orderId;

    if (!targetOrderId || !utr) {
      return res.status(400).json({ error: "Missing required order_id or utr" });
    }

    try {
      const DIVINEPAY_CONFIG = {
        utrUrl: process.env.DIVINEPAY_UTR_URL || "https://divinepay.us.cc/api/payin/submit-utr",
        apiKey: process.env.DIVINEPAY_API_KEY || "your_divinepay_secret_key_here",
      };

      const response = await axios.post(
        DIVINEPAY_CONFIG.utrUrl,
        { order_id: targetOrderId, utr },
        {
          headers: {
            "x-api-key": DIVINEPAY_CONFIG.apiKey,
            "Authorization": `Bearer ${DIVINEPAY_CONFIG.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(
        error.response?.data || { success: false, message: "Failed to submit UTR." }
      );
    }
  });

  // Divine Pay Payment Webhook Callback Handler
  app.post("/api/payment-callback", async (req, res) => {
    const params = req.body;

    try {
      res.status(200).send("success");
    } catch (error) {
      res.status(500).send("error");
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
