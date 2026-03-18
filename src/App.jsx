import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Required for map rendering
import "./App.css";

function App() {
  const singaporeCenter = [1.3521, 103.8198];

  return (
    <div
      className="map-wrapper"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <MapContainer
        center={singaporeCenter}
        zoom={11}
        scrollWheelZoom={true}
        style={{
          height: "400px",
          width: "95%",
          marginBottom: "2rem",
          alignSelf: "center",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dummy marker */}
        <Marker position={singaporeCenter}>
          <Tooltip direction="top" offset={[-15, -20]} opacity={1}>
            <div style={{ padding: "5px" }}>
              <strong>Singapore Central</strong> <br />
              <span>Address: </span>
              <br />
              <small>Postal Code: 123456</small>
            </div>
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;
