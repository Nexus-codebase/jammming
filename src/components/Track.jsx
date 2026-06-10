const formatDuration = (durationMs) => {
  if (!durationMs) {
    return '';
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

function Track({ track, onAdd, onRemove, isRemoval }) {
  const handleClick = () => {
    if (isRemoval) {
      onRemove(track);
      return;
    }
    onAdd(track);
  };

  return (
    <article
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid #f0e4cb'
      }}
    >
      <div>
        <strong>{track.name}</strong>
        <div style={{ opacity: 0.75, fontSize: '0.9rem' }}>
          {track.artist} | {track.album}
        </div>
        <div style={{ opacity: 0.7, fontSize: '0.82rem', marginTop: '0.35rem' }}>
          {track.durationMs ? `Duration: ${formatDuration(track.durationMs)}` : 'Duration unavailable'}
        </div>
        {track.previewUrl ? (
          <audio controls preload="none" style={{ marginTop: '0.55rem', width: '100%', maxWidth: '300px' }}>
            <source src={track.previewUrl} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        ) : (
          <div style={{ opacity: 0.7, fontSize: '0.82rem', marginTop: '0.35rem' }}>No preview sample available.</div>
        )}
      </div>
      <button type="button" onClick={handleClick} className="primary-btn">
        {isRemoval ? '-' : '+'}
      </button>
    </article>
  );
}

export default Track;
