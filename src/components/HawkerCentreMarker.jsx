import { Marker, Popup, Tooltip } from "react-leaflet";

const HawkerCentreMarker = ({ centre }) => {
  const coordinates = centre?.geometry?.coordinates ?? [];

  // GeoJSON hawker centre coordinates are [longitude, latitude]
  const [longitude, latitude] = coordinates;

  if (isNaN(latitude) || isNaN(longitude)) {
    // Handle cases where coordinates are missing or invalid
    return null;
  }

  const position = [latitude, longitude];
  const properties = centre?.properties ?? {};

  const name =
    properties.NAME ?? properties.name_of_centre ?? "Unknown Hawker Centre";
  const postalCode = properties.ADDRESSPOSTALCODE ?? "N/A";
  const address =
    properties.ADDRESS_MYENV ??
    [properties.ADDRESSBLOCKHOUSENUMBER, properties.ADDRESSSTREETNAME]
      .filter(Boolean)
      .join(", ");

  const photoUrl = properties.PHOTOURL;

  return (
    <Marker position={position}>
      {/* Hover functionality*/}
      <Tooltip direction="top" offset={[-15, -20]}>
        <strong>{name}</strong>
      </Tooltip>

      {/* Click-to-view functionality*/}
      <Popup
        autoPan={true}
        autoPanPadding={[50, 50]}
        keepInView={true}
        maxWidth={280}
      >
        <div style={{ maxWidth: "260px" }}>
          <h3>{name}</h3>
          <p>Address: {address}</p>
          <p>Postal Code: {postalCode}</p>

          {photoUrl && (
            <img
              src={photoUrl}
              alt={name}
              style={{
                display: "block",
                width: "100%",
                maxWidth: "220px",
                maxHeight: "140px",
                objectFit: "cover",
                margin: "8px auto 0",
                borderRadius: "5px",
              }}
            />
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default HawkerCentreMarker;
