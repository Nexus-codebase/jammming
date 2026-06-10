const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin;
const SCOPES = [
  'playlist-modify-private',
  'playlist-modify-public'
].join(' ');

let accessToken = '';
let expiresAt = 0;

const parseHashParams = (hash) => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    token: params.get('access_token') || '',
    expiresIn: Number(params.get('expires_in') || 0)
  };
};

const clearAuthHash = () => {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
};

const mapTrack = (track) => ({
  id: track.id,
  name: track.name,
  artist: track.artists?.map((artist) => artist.name).join(', ') || 'Unknown Artist',
  album: track.album?.name || 'Unknown Album',
  uri: track.uri
});

const ensureClientId = () => {
  if (!CLIENT_ID) {
    throw new Error('Missing Spotify Client ID. Set VITE_SPOTIFY_CLIENT_ID in your environment.');
  }
};

const ensureAccessToken = () => {
  ensureClientId();

  const now = Date.now();
  if (accessToken && now < expiresAt) {
    return accessToken;
  }

  const { token, expiresIn } = parseHashParams(window.location.hash);
  if (token) {
    accessToken = token;
    expiresAt = now + expiresIn * 1000;
    clearAuthHash();
    return accessToken;
  }

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

  window.location.assign(authUrl.toString());
  return '';
};

const spotifyRequest = async (endpoint, options = {}) => {
  const token = ensureAccessToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify API error (${response.status}): ${errorText || response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const Spotify = {
  async search(term) {
    if (!term.trim()) {
      return [];
    }

    const encodedTerm = encodeURIComponent(term.trim());
    const data = await spotifyRequest(`/search?type=track&q=${encodedTerm}&limit=20`);

    return data?.tracks?.items?.map(mapTrack) || [];
  },

  async savePlaylist(playlistName, trackUris) {
    const cleanPlaylistName = playlistName.trim();
    if (!cleanPlaylistName || !trackUris.length) {
      return;
    }

    const user = await spotifyRequest('/me');
    const playlist = await spotifyRequest(`/users/${user.id}/playlists`, {
      method: 'POST',
      body: JSON.stringify({ name: cleanPlaylistName })
    });

    await spotifyRequest(`/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris: trackUris })
    });
  }
};
