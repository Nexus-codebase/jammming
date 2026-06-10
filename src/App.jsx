import { useState } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';
import { Spotify } from './util/Spotify';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [message, setMessage] = useState('Search for songs, then build your playlist.');

  const addTrack = (track) => {
    if (playlistTracks.find((savedTrack) => savedTrack.id === track.id)) return;
    setPlaylistTracks((prev) => [...prev, track]);
  };

  const removeTrack = (track) => {
    setPlaylistTracks((prev) => prev.filter((savedTrack) => savedTrack.id !== track.id));
  };

  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  const savePlaylist = async () => {
    const uris = playlistTracks.map((track) => track.uri);
    try {
      await Spotify.savePlaylist(playlistName, uris);
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
      setMessage('Playlist saved to Spotify.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const search = async (term) => {
    try {
      const results = await Spotify.search(term);
      setSearchResults(results);
      setMessage(results.length ? `Found ${results.length} track(s).` : 'No matching tracks found.');
    } catch (error) {
      setMessage(error.message);
      setSearchResults([]);
    }
  };

  return (
    <div className="app">
      <h1>
        Ja<span>mmm</span>ing
      </h1>
      <SearchBar onSearch={search} />
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>{message}</p>
      <div className="app-playlist">
        <SearchResults searchResults={searchResults} onAdd={addTrack} />
        <Playlist
          playlistName={playlistName}
          playlistTracks={playlistTracks}
          onRemove={removeTrack}
          onNameChange={updatePlaylistName}
          onSave={savePlaylist}
        />
      </div>
    </div>
  );
}

export default App;
