import { IoClose } from "react-icons/io5";

const SearchBar = ({ value, onChange }) => {
  // Boolean flag controls clear button visibility
  const hasValue = value.trim().length > 0;

  return (
    <label className="search-bar" htmlFor="hawker-centre-search">
      <span className="filter-label">Search</span>
      <div className="search-input-wrap">
        <input
          id="hawker-centre-search"
          type="text"
          placeholder="Search name of hawker centre..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {hasValue && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onChange("")}
            aria-label="Clear search text"
          >
            <IoClose aria-hidden="true" size={16} />
          </button>
        )}
      </div>
    </label>
  );
};

export default SearchBar;
