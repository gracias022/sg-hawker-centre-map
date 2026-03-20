import "leaflet/dist/leaflet.css"; // Required for map rendering
import "./App.css";
import MapComponent from "./components/MapComponent";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h3>Singapore Hawker Centres Map</h3>
      </header>
      <main className="App-main">
        <MapComponent />
      </main>
    </div>
  );
}

export default App;
