import "leaflet/dist/leaflet.css"; // Required for map rendering
import { useMemo, useState } from "react";
import "./App.css";
import HawkerCentreFilter from "./components/HawkerCentreFilter";
import MapComponent from "./components/MapComponent";
import SearchBar from "./components/SearchBar";
import { useHawkerCentres } from "./hooks/useHawkerCentres";

function App() {
  const [searchText, setSearchText] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const { hawkerCentres = [], loading, error } = useHawkerCentres();

  // Retrieve regions from hawker centre data for dropdown filter
  // Build dropdown options dynamically so that they always match backend-enriched data
  const availableRegions = useMemo(() => {
    return Array.from(
      new Set(
        hawkerCentres
          .map((centre) => centre?.properties?.REGION)
          .filter(Boolean),
      ),
    ).sort();
  }, [hawkerCentres]);

  // Retrieves filtered list of hawker centres based on search and region filter
  const filteredCentres = useMemo(() => {
    return hawkerCentres.filter((centre) => {
      const name = centre?.properties?.NAME ?? "";
      const region = centre?.properties?.REGION ?? "";

      const matchesSearch = searchText
        ? name.toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchesRegion = selectedRegion ? region === selectedRegion : true;

      return matchesSearch && matchesRegion;
    });
  }, [hawkerCentres, searchText, selectedRegion]);

  return (
    <div className="App">
      <header className="App-header">
        <h3>Singapore Hawker Centres Map</h3>
      </header>
      <main className="App-main">
        <section className="app-content">
          <section className="filters-row">
            <SearchBar value={searchText} onChange={setSearchText} />
            <HawkerCentreFilter
              regions={availableRegions}
              value={selectedRegion}
              onChange={setSelectedRegion}
            />
          </section>

          <p className="result-count">
            Showing {filteredCentres.length} of {hawkerCentres.length} hawker
            centres
          </p>

          <MapComponent
            hawkerCentres={filteredCentres}
            loading={loading}
            error={error}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
