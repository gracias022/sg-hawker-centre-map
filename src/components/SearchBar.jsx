const SearchBar = ({ value, onChange }) => {
  return (
    <label className="search-bar" htmlFor="hawker-centre-search">
      <span className="visually-hidden">Search hawker centres by name</span>
      <input
        id="hawker-centre-search"
        type="text"
        placeholder="Search hawker centre name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
};

export default SearchBar;
