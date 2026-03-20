const HawkerCentreFilter = ({ regions = [], value, onChange }) => {
  return (
    <label className="region-filter" htmlFor="region-filter-select">
      <span className="filter-label">Select Region</span>
      <select
        id="region-filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All regions</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </label>
  );
};

export default HawkerCentreFilter;
