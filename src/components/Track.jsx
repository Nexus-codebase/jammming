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
      </div>
      <button type="button" onClick={handleClick} className="primary-btn">
        {isRemoval ? '-' : '+'}
      </button>
    </article>
  );
}

export default Track;
