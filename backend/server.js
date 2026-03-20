const express = require("express");
const cors = require("cors");
const turf = require("@turf/turf");

const app = express();
const PORT = 4000;
const HAWKER_DATASET_ID = "d_4a086da0a5553be1d89383cd90d07ecd";
const REGION_DATASET_ID = "d_4ce0038f7ac689652350bb91b7fb92ed";
const CACHE_MS = 10 * 60 * 1000;
const REGION_CACHE_MS = 24 * 60 * 60 * 1000;

function getPollUrl(datasetId) {
  return `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`;
}

async function fetchDatasetGeoJson(datasetId) {
  // data.gov.sg uses a poll endpoint that returns a short-lived signed download URL
  const pollResponse = await fetch(getPollUrl(datasetId));
  if (!pollResponse.ok) {
    throw new Error(
      `poll-download failed for ${datasetId}: HTTP ${pollResponse.status}`,
    );
  }

  const pollJson = await pollResponse.json();
  const signedUrl = pollJson?.data?.url;
  if (!signedUrl) {
    throw new Error(`Missing signed URL for ${datasetId}`);
  }

  const dataResponse = await fetch(signedUrl);
  if (!dataResponse.ok) {
    throw new Error(
      `GeoJSON fetch failed for ${datasetId}: HTTP ${dataResponse.status}`,
    );
  }

  return dataResponse.json();
}

function getRegionName(properties = {}) {
  const regionName = properties.REGION_N;
  return typeof regionName === "string" && regionName.trim()
    ? regionName.trim()
    : "Unknown";
}

function deriveRegionCentroidsFromPolygons(features = []) {
  return features
    .filter(
      (feature) =>
        feature?.geometry?.type === "Polygon" ||
        feature?.geometry?.type === "MultiPolygon",
    )
    .map((feature) => {
      const name = getRegionName(feature?.properties);
      const centroid = turf.centroid(feature);
      // For concave/multipolygon shapes, centroid may fall outside the polygon; use a safe in-shape point
      const inside = turf.booleanPointInPolygon(centroid, feature);
      const representativePoint = inside
        ? centroid
        : turf.pointOnFeature(feature);
      const coordinates = representativePoint?.geometry?.coordinates ?? [];

      return {
        name,
        lng: coordinates[0],
        lat: coordinates[1],
      };
    })
    .filter(
      (region) =>
        typeof region.name === "string" &&
        region.name !== "Unknown" &&
        Number.isFinite(region.lat) &&
        Number.isFinite(region.lng),
    );
}

async function getRegionCentroids(cache, now) {
  if (cache.regionCentroids && now - cache.regionTs < REGION_CACHE_MS) {
    return cache.regionCentroids;
  }

  const regionGeoJson = await fetchDatasetGeoJson(REGION_DATASET_ID);
  const regionFeatures = regionGeoJson?.features ?? [];
  const centroids = deriveRegionCentroidsFromPolygons(regionFeatures);

  if (!centroids.length) {
    throw new Error(
      "No valid region centroids derived from official polygon dataset",
    );
  }

  cache.regionCentroids = centroids;
  cache.regionTs = now;
  return centroids;
}

function deriveRegionFromCoordinates(latitude, longitude, regionCentroids) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "Unknown";
  }

  if (!Array.isArray(regionCentroids) || regionCentroids.length === 0) {
    return "Unknown";
  }

  let closest = regionCentroids[0];
  let minDistanceSquared = Number.POSITIVE_INFINITY;

  for (const region of regionCentroids) {
    // Compare squared distances
    const dLat = latitude - region.lat;
    const dLng = longitude - region.lng;
    const distanceSquared = dLat * dLat + dLng * dLng;

    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      closest = region;
    }
  }

  return closest.name;
}

function enrichFeature(feature, regionCentroids) {
  const coordinates = feature?.geometry?.coordinates;
  const longitude = coordinates?.[0];
  const latitude = coordinates?.[1];
  const derivedRegion = deriveRegionFromCoordinates(
    latitude,
    longitude,
    regionCentroids,
  );

  return {
    ...feature,
    properties: {
      ...(feature?.properties ?? {}),
      REGION: derivedRegion,
    },
  };
}

// Allow Vite frontend
app.use(cors({ origin: "http://localhost:5173" }));

// Simple in-memory cache
let cache = { features: null, ts: 0, regionCentroids: null, regionTs: 0 };

app.get("/api/hawker-centres", async (_req, res) => {
  try {
    const now = Date.now();
    if (cache.features && now - cache.ts < CACHE_MS) {
      return res.json({ features: cache.features });
    }

    const regionCentroids = await getRegionCentroids(cache, now);

    const geojson = await fetchDatasetGeoJson(HAWKER_DATASET_ID);
    const features = (geojson?.features ?? []).map((feature) =>
      enrichFeature(feature, regionCentroids),
    );

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
