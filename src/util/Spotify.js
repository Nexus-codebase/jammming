const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin;
const SCOPES = [
  'playlist-modify-private',
  'playlist-modify-public'
].join(' ');

const ACCESS_TOKEN_KEY = 'jammming_spotify_access_token';
const EXPIRES_AT_KEY = 'jammming_spotify_expires_at';

let accessToken = '';
let expiresAt = 0;
let tokenExpiryTimer = null;

const parseHashParams = (hash) => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    token: params.get('access_token') || '',
    expiresIn: Number(params.get('expires_in') || 0),
    error: params.get('error') || '',
    errorDescription: params.get('error_description') || ''
  };
};

const clearAuthHash = () => {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
};

const persistToken = (token, newExpiresAt) => {
  accessToken = token;
  expiresAt = newExpiresAt;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  sessionStorage.setItem(EXPIRES_AT_KEY, String(newExpiresAt));
  scheduleTokenExpiry(newExpiresAt);
};

const clearStoredToken = () => {
  clearTokenExpiryTimer();
  accessToken = '';
  expiresAt = 0;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_AT_KEY);
};

const clearTokenExpiryTimer = () => {
  if (tokenExpiryTimer) {
    window.clearTimeout(tokenExpiryTimer);
    tokenExpiryTimer = null;
  }
};

const scheduleTokenExpiry = (newExpiresAt) => {
  clearTokenExpiryTimer();
  const msUntilExpiry = newExpiresAt - Date.now();

  if (msUntilExpiry <= 0) {
    clearStoredToken();
    return;
  }

  tokenExpiryTimer = window.setTimeout(() => {
    clearStoredToken();
  }, msUntilExpiry);
};

const mapTrack = (track) => ({
  id: track.id,
  name: track.name,
  artist: track.artists?.map((artist) => artist.name).join(', ') || 'Unknown Artist',
  album: track.album?.name || 'Unknown Album',
  uri: track.uri,
  previewUrl: track.preview_url || '',
  durationMs: track.duration_ms || 0,
  spotifyUrl: track.external_urls?.spotify || ''
});

const ensureClientId = () => {
  if (!CLIENT_ID) {
    throw new Error('Missing Spotify Client ID. Set VITE_SPOTIFY_CLIENT_ID in your environment.');
  }
};

const getStoredToken = () => {
  const storedToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || '';
  const storedExpiresAt = Number(sessionStorage.getItem(EXPIRES_AT_KEY) || 0);

  if (!storedToken || !storedExpiresAt) {
    return '';
  }

  if (Date.now() >= storedExpiresAt) {
    clearStoredToken();
    return '';
  }

  accessToken = storedToken;
  expiresAt = storedExpiresAt;
  scheduleTokenExpiry(storedExpiresAt);
  return accessToken;
};

const getAccessToken = ({ allowRedirect }) => {
  ensureClientId();

  const now = Date.now();
  if (accessToken && now < expiresAt) {
    return accessToken;
  }

  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }

  const {
    token,
    expiresIn,
    error,
    errorDescription
  } = parseHashParams(window.location.hash);

  if (error) {
    clearAuthHash();
    throw new Error(
      `Spotify authorization failed: ${errorDescription || error}. Click Connect Spotify and try again.`
    );
  }

  if (token) {
    const issuedAt = Date.now();
    persistToken(token, issuedAt + expiresIn * 1000);
    clearAuthHash();
    return accessToken;
  }

  if (!allowRedirect) {
    return '';
  }

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

  window.location.assign(authUrl.toString());
  return '';
};

const spotifyRequest = async (endpoint, options = {}, retryOnUnauthorized = true) => {
  const token = getAccessToken({ allowRedirect: true });
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

  if (response.status === 401 && retryOnUnauthorized) {
    clearStoredToken();
    return spotifyRequest(endpoint, options, false);
  }

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
  connect() {
    getAccessToken({ allowRedirect: true });
  },

  isAuthenticated() {
    try {
      return Boolean(getAccessToken({ allowRedirect: false }));
    } catch {
      return false;
    }
  },

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
