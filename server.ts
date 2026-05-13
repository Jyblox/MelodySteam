import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import youtube from "youtube-search-api";

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

  // Real YouTube Search Proxy
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    try {
      const result = await youtube.GetListByKeyword(query, false, 10, [{ type: 'video' }]);
      const formatted = result.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        artist: item.channelTitle || "YouTube Music",
        duration: item.length?.accessibility?.accessibilityData?.label || "4:00",
        thumbnail: item.thumbnail?.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop"
      }));
      res.json(formatted);
    } catch (error) {
      console.error("Search Error:", error);
      res.status(500).json({ error: "Failed to fetch from YouTube" });
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
