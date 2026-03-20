const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;
const DATASET_ID = "d_4a086da0a5553be1d89383cd90d07ecd";
const POLL_URL = `https://api-open.data.gov.sg/v1/public/api/datasets/${DATASET_ID}/poll-download`;

// Allow Vite frontend
app.use(cors({ origin: "http://localhost:5173" }));

// Simple in-memory cache
let cache = { features: null, ts: 0 };
const CACHE_MS = 10 * 60 * 1000;

app.get("/api/hawker-centres", async (_req, res) => {
  try {
    const now = Date.now();
    if (cache.features && now - cache.ts < CACHE_MS) {
      return res.json({ features: cache.features });
    }

    // Get signed download URL
    const pollResponse = await fetch(POLL_URL);
    if (!pollResponse.ok) {
      return res
        .status(pollResponse.status)
        .json({ error: "poll-download failed" });
    }

    const pollJson = await pollResponse.json();
    const signedUrl = pollJson?.data?.url;
    if (!signedUrl) {
      return res.status(500).json({ error: "Missing signed URL" });
    }

    // Fetch GeoJSON from signed URL (server-side, no browser CORS issue)
    const dataResponse = await fetch(signedUrl);
    if (!dataResponse.ok) {
      return res
        .status(dataResponse.status)
        .json({ error: "GeoJSON fetch failed" });
    }

    const geojson = await dataResponse.json();
    const features = geojson?.features ?? [];

    cache = { features, ts: now };
    return res.json({ features });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
