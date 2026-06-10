import TrackList from './TrackList';

function Playlist({ playlistName, playlistTracks, onRemove, onNameChange, onSave }) {
  const canSave = Boolean(playlistName.trim()) && playlistTracks.length > 0;

  return (
    <section className="panel">
      <input
        value={playlistName}
        onChange={(event) => onNameChange(event.target.value)}
        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e5d3ab' }}
      />
      <TrackList tracks={playlistTracks} onRemove={onRemove} isRemoval />
      <button type="button" className="secondary-btn" onClick={onSave} disabled={!canSave}>
        {canSave ? 'Save to Spotify' : 'Add tracks to save'}
      </button>
    </section>
  );
}

export default Playlist;
