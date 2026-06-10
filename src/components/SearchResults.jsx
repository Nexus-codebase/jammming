import TrackList from './TrackList';

function SearchResults({ searchResults, onAdd }) {
  return (
    <section className="panel">
      <h2>Results</h2>
      <TrackList tracks={searchResults} onAdd={onAdd} isRemoval={false} />
    </section>
  );
}

export default SearchResults;
