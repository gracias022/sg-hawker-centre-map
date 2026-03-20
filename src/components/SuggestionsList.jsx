const SuggestionsList = ({ suggestions = [], onSelect, isOpen }) => {
  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  return (
    <ul className="suggestions-list">
      {suggestions.slice(0, 8).map((centre) => (
        <li key={centre.properties.NAME}>
          <button
            className="suggestion-item"
            onClick={() => onSelect(centre)}
            type="button"
          >
            <div className="suggestion-name">{centre.properties.NAME}</div>
            <div className="suggestion-detail">{centre.properties.REGION}</div>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SuggestionsList;
