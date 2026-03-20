# Singapore Hawker Centre Map

## Overview

This project is an interactive map of hawker centres in Singapore.

Users can:

- view hawker centre markers on a Leaflet map
- search hawker centres by name
- filter hawker centres by region
- use search suggestions to quickly jump to a hawker centre
- auto-focus the map and open marker popups for selected results

## Approach and Architecture

The app uses a simple frontend-backend split.

- Frontend: React + Vite + react-leaflet
- Backend: Express API proxy and data enrichment layer
- Data Source: data.gov.sg GeoJSON datasets

### Frontend Flow

- `src/App.jsx` is the state coordinator for search text, selected region, selected centre, and suggestion visibility.
- `src/components/SearchBar.jsx` renders the search input and suggestion dropdown.
- `src/components/SuggestionsList.jsx` renders top matching centres.
- `src/components/MapComponent.jsx` renders the map, handles fit-bounds, and flies to selected centres.
- `src/components/HawkerCentreMarker.jsx` renders marker popup content and opens popup for selected results.

### Backend Flow

- `backend/server.js` fetches hawker centre and region datasets from data.gov.sg.
- Backend enriches each hawker centre with a derived `REGION` value using turf centroid/point logic.
- Response is cached in memory to reduce repeated external API calls.

### Architecture Notes

- Vite dev server proxies `/api` calls to backend (`http://localhost:4000`).
- Express API proxy is used to avoid browser CORS restrictions when accessing data.gov.sg directly from frontend code, and to centralize data enrichment/caching logic in one layer.
- Search + region filtering happen client-side on fetched GeoJSON features.
- Marker popup reopen behavior is handled with a selection signal for repeat selections.

## Setup Instructions

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install Dependencies

Install frontend dependencies from project root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

### Run the App

Start backend (Terminal 1):

```bash
cd backend
node server.js
```

Start frontend (Terminal 2):

```bash
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Testing Instructions

There are currently no automated unit/integration tests implemented in this submission.

Available verification commands:

```bash
# frontend lint
npm run lint

# frontend production build check
npm run build
```

Backend `npm test` is currently a placeholder and not implemented.

Basic API smoke test:

```bash
curl http://localhost:4000/api/hawker-centres
```

Expected result: JSON response containing a `features` array.

Manual test checklist:

- App loads map and markers successfully
- Search text filters markers in real time
- Region filter narrows markers correctly and map pans/zooms to keep filtered results in view
- Suggestion click flies to marker and opens popup
- Re-selecting the same suggestion after closing the popup and modifying the search field re-opens popup
- Hovering over a marker shows the hawker centre's name tooltip
- Clicking a marker opens detailed popup content (name, address, postal code)

## Assumptions / Challenges

### Assumptions

- data.gov.sg endpoints are reachable during runtime.
- Hawker features contain valid point coordinates.
- Region polygons are suitable for centroid-based nearest-region derivation.

### Challenges and Decisions

1. Region derivation
   - Decision: region labels were not directly available on all hawker records, so region is derived server-side.
   - Current method: nearest-region-centroid heuristic from coordinates (turf).
   - Limitation: possible boundary misclassification for centres near region edges.
   - Future improvement: Turf point-in-polygon against official region boundaries.

2. Search-to-map interaction
   - Decision:
     - implemented explicit handling for popup reopen behavior. This ensures that repeated selection of the same hawker centre from the suggestion list after updates to search input reliably triggers the map highlight.
     - Additionally, the suggestion list is set to hide upon suggestion selection to provide an unobstructed view of the map.
   - Limitation: behavior relies on client-side selection signaling logic, and editing the search field after a successful selection can cause brief popup jitter/re-rendering before the popup settles.
   - Future improvement: pause popup auto-open/auto-focus while typing and only re-apply after input stabilizes; also add keyboard navigation for suggestions.

3. Marker density at low zoom
   - Decision: marker clustering was considered but deprioritized to focus on core search/filter UX and submission completeness.
   - Limitation: dense, zoomed-out views can feel crowded.
   - Future improvement: add marker clustering (e.g., via react-leaflet-cluster).

### Current Limitations

- No automated test suite yet.
- Clustering is not enabled for dense, zoomed-out marker views.
- Popup may briefly jitter when search text is edited after selecting a suggestion with an open popup.
- Caching is in-memory only and resets on server restart.

## Data Citation

- National Environment Agency. (2019). Hawker Centres (GEOJSON) (2026) [Dataset]. data.gov.sg. Retrieved March 18, 2026 from https://data.gov.sg/datasets/d_4a086da0a5553be1d89383cd90d07ecd/view
- Urban Redevelopment Authority. (2026). Master Plan 2025 Region Boundary (No Sea) (2026) [Dataset]. data.gov.sg. Retrieved March 20, 2026 from https://data.gov.sg/datasets/d_4ce0038f7ac689652350bb91b7fb92ed/view
