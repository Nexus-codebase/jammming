import Track from './Track';

function TrackList({ tracks, onAdd, onRemove, isRemoval }) {
  if (!tracks.length) {
    return <p style={{ opacity: 0.7 }}>No tracks yet.</p>;
  }

  return (
    <div>
      {tracks.map((track) => (
        <Track
          key={track.id}
          track={track}
          onAdd={onAdd}
          onRemove={onRemove}
          isRemoval={isRemoval}
        />
      ))}
    </div>
  );
}

export default TrackList;
