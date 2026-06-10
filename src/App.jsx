import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';
import { Spotify } from './util/Spotify';
import './App.css';

const PENDING_SEARCH_TERM_KEY = 'jammming_pending_search_term';
const PLAYLIST_NAME_KEY = 'jammming_playlist_name';
const PLAYLIST_TRACKS_KEY = 'jammming_playlist_tracks';

const loadStoredPlaylistTracks = () => {
  try {
    const storedValue = sessionStorage.getItem(PLAYLIST_TRACKS_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedTracks = JSON.parse(storedValue);
    if (!Array.isArray(parsedTracks)) {
      return [];
    }

    return parsedTracks.filter((track) => track?.id && track?.uri);
  } catch {
    return [];
  }
};

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState(
    () => sessionStorage.getItem(PLAYLIST_NAME_KEY) || 'New Playlist'
  );
  const [playlistTracks, setPlaylistTracks] = useState(loadStoredPlaylistTracks);
  const [isConnected, setIsConnected] = useState(Spotify.isAuthenticated());
  const [message, setMessage] = useState('Search for songs, then build your playlist.');
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);

  const connectSpotify = () => {
    try {
      Spotify.connect();
      setIsConnected(true);
      setMessage('Spotify connected. You can search and save playlists.');
    } catch (error) {
      setMessage(error.message);
      setIsConnected(false);
    }
  };

  const addTrack = (track) => {
    setPlaylistTracks((prev) => {
      if (prev.find((savedTrack) => savedTrack.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
  };

  const removeTrack = (track) => {
    setPlaylistTracks((prev) => prev.filter((savedTrack) => savedTrack.id !== track.id));
  };

  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  const savePlaylist = async () => {
    const uris = playlistTracks.map((track) => track.uri);
    setIsSavingPlaylist(true);
    try {
      await Spotify.savePlaylist(playlistName, uris);
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
      setIsConnected(true);
      setMessage('Playlist saved to Spotify.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  const search = async (term) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) {
      return;
    }

    sessionStorage.setItem(PENDING_SEARCH_TERM_KEY, cleanTerm);

    try {
      const results = await Spotify.search(cleanTerm);
      setSearchResults(results);
      setIsConnected(true);
      setMessage(results.length ? `Found ${results.length} track(s).` : 'No matching tracks found.');
      sessionStorage.removeItem(PENDING_SEARCH_TERM_KEY);
    } catch (error) {
      setMessage(error.message);
      setIsConnected(false);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const pendingTerm = sessionStorage.getItem(PENDING_SEARCH_TERM_KEY);
    if (pendingTerm && Spotify.isAuthenticated()) {
      search(pendingTerm);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(PLAYLIST_NAME_KEY, playlistName);
  }, [playlistName]);

  useEffect(() => {
    sessionStorage.setItem(PLAYLIST_TRACKS_KEY, JSON.stringify(playlistTracks));
  }, [playlistTracks]);

  const filteredSearchResults = searchResults.filter(
    (track) => !playlistTracks.some((playlistTrack) => playlistTrack.id === track.id)
  );

  return (
    <div className="app">
      {isSavingPlaylist ? (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-card">Saving playlist to Spotify...</div>
        </div>
      ) : null}
      <h1>
        Ja<span>mmm</span>ing
      </h1>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <button type="button" className="secondary-btn" onClick={connectSpotify}>
          {isConnected ? 'Reconnect Spotify' : 'Connect Spotify'}
        </button>
      </div>
      <SearchBar onSearch={search} />
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>{message}</p>
      <div className="app-playlist">
        <SearchResults searchResults={filteredSearchResults} onAdd={addTrack} />
        <Playlist
          playlistName={playlistName}
          playlistTracks={playlistTracks}
          onRemove={removeTrack}
          onNameChange={updatePlaylistName}
          onSave={savePlaylist}
          isSaving={isSavingPlaylist}
        />
      </div>
    </div>
  );
}

export default App;
