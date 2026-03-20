import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import HawkerCentreMarker from "./HawkerCentreMarker";

const AutoFitBounds = ({ markerPositions }) => {
  const map = useMap();

  useEffect(() => {
    if (!markerPositions.length) {
      return;
    }

    // Add debounce to reduce jumpines when rapid typing in search bar
    // causes quick successive updates to marker positions
    const timeoutId = setTimeout(() => {
      if (markerPositions.length === 1) {
        map.setView(markerPositions[0], 15, { animate: true });
        return;
      }

      map.fitBounds(markerPositions, {
        padding: [40, 40],
        maxZoom: 15,
        animate: true,
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [map, markerPositions]);

  return null;
};

const MapComponent = ({
  hawkerCentres = [],
  loading = false,
  error = null,
}) => {
  const [flashMessage, setFlashMessage] = useState("");

  // Derive valid [lat, lng] points once for bounds fitting and marker rendering
  const markerPositions = useMemo(() => {
    return hawkerCentres
      .map((centre) => {
        const coordinates = centre?.geometry?.coordinates ?? [];
        const longitude = coordinates[0];
        const latitude = coordinates[1];

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return [latitude, longitude];
      })
      .filter(Boolean);
  }, [hawkerCentres]);

  // Default position: center of Singapore
  const position = [1.3521, 103.8198];

  useEffect(() => {
    if (!error) {
      setFlashMessage("");
      return;
    }

    // Display API errors as a toast message while keeping the map visible
    setFlashMessage(`Unable to load hawker centres. ${error.message}`);

    const timeoutId = setTimeout(() => {
      setFlashMessage("");
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [error]);

  return (
    <section className="map-layout">
      {flashMessage && (
        <div className="map-toast" role="status" aria-live="polite">
          <span>{flashMessage}</span>
          <button
            type="button"
            className="map-toast-close"
            onClick={() => setFlashMessage("")}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      )}

      {loading && <p className="map-loading">Loading hawker centres...</p>}
      <section className="map-panel">
        <MapContainer
          center={position}
          zoom={12}
          style={{
            height: "min(68vh, 680px)",
            width: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {!loading && <AutoFitBounds markerPositions={markerPositions} />}

          {!loading &&
            hawkerCentres.map((centre, idx) => (
              <HawkerCentreMarker
                key={centre?.properties?.OBJECTID || idx}
                centre={centre}
              />
            ))}
        </MapContainer>
      </section>
    </section>
  );
};

export default MapComponent;
