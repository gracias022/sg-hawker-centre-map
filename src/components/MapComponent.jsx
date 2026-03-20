import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useHawkerCentres } from "../hooks/useHawkerCentres";
import HawkerCentreMarker from "./HawkerCentreMarker";

const MapComponent = () => {
  const { hawkerCentres = [], loading, error } = useHawkerCentres();
  const [flashMessage, setFlashMessage] = useState("");

  // Default position: center of Singapore
  const position = [1.3521, 103.8198];

  useEffect(() => {
    if (!error) {
      setFlashMessage("");
      return;
    }

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
