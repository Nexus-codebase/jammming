import { useState } from 'react';

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!term.trim()) return;
    onSearch(term);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar panel" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <input
        type="text"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search songs, artists, albums"
        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e5d3ab' }}
      />
      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
        <button type="submit" className="primary-btn">
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
