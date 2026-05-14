import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Payment Simulation Endpoint
  app.post("/api/payments/verify", (req, res) => {
    const { paymentId, amount } = req.body;
    if (paymentId && amount) {
      res.json({ status: "success", isPremium: true });
    } else {
      res.status(400).json({ status: "error", message: "Invalid payment data" });
    }
  });

  // Jamendo Search Proxy
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    try {
      const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=c9cb2a0a&search=${encodeURIComponent(query)}&limit=15&format=json`);
      const jamendoData = await response.json();
      
      const formatted = (jamendoData.results || []).map((item: any) => {
        const formatDuration = (secs: number) => {
          const m = Math.floor(secs / 60);
          const s = secs % 60;
          return `${m}:${s.toString().padStart(2, '0')}`;
        };

        return {
          id: item.id,
          title: item.name,
          artist: item.artist_name,
          duration: formatDuration(item.duration),
          thumbnail: item.image,
          streamUrl: item.audio
        };
      });
      res.json(formatted);
    } catch (error) {
      console.error("Search Error:", error);
      res.status(500).json({ error: "Failed to fetch from Jamendo" });
    }
  });

  // Jamendo Trending Endpoint
  app.get("/api/trending", async (req, res) => {
    try {
      const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=c9cb2a0a&order=popularity_week&limit=10&format=json`);
      const jamendoData = await response.json();
      
      const formatted = (jamendoData.results || []).map((item: any) => {
        const formatDuration = (secs: number) => {
          const m = Math.floor(secs / 60);
          const s = secs % 60;
          return `${m}:${s.toString().padStart(2, '0')}`;
        };

        return {
          id: item.id,
          title: item.name,
          artist: item.artist_name,
          duration: formatDuration(item.duration),
          thumbnail: item.image,
          streamUrl: item.audio
        };
      });
      res.json(formatted);
    } catch (error) {
      console.error("Trending Error:", error);
      res.status(500).json({ error: "Failed to fetch trending from Jamendo" });
    }
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
