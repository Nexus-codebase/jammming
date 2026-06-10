# Jammming

Jammming is a React web app that lets users search Spotify tracks, build a custom playlist, and save that playlist to their Spotify account.

## Purpose

This project demonstrates front-end application architecture with React, API integration, OAuth authentication, and state-driven UI updates.

## Technologies Used

- React 18
- Vite 5
- JavaScript (ES modules)
- Spotify Web API
- Spotify OAuth (Implicit Grant flow)

## Features

- Search Spotify by song title, artist, or album keywords
- View track details for each result:
	- Song title
	- Artist
	- Album
- Add and remove tracks from a custom playlist
- Rename the custom playlist
- Save the playlist directly to the user Spotify account
- Basic success and error feedback messages in the UI

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Spotify application in the Spotify Developer Dashboard.

3. Configure your redirect URI:

- For local development, use `http://127.0.0.1:5173` (or your Vite port/host).
- Add this same URI in the Spotify app settings.

4. Create a `.env` file in the project root:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173
```

5. Start the dev server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production assets
- `npm run preview` - Preview production build locally

## Deployment

You can deploy this Vite app to services like Netlify, Vercel, GitHub Pages, or Cloudflare Pages.

Deployment checklist:

1. Set environment variables (`VITE_SPOTIFY_CLIENT_ID`, `VITE_SPOTIFY_REDIRECT_URI`) in your hosting platform.
2. Add your production redirect URI to Spotify Developer Dashboard.
3. Build command: `npm run build`
4. Publish directory: `dist`

### GitHub Pages (Configured)

This repository includes a workflow at `.github/workflows/deploy-pages.yml` that automatically deploys on every push to `main`.

Required repository variable:

- `VITE_SPOTIFY_CLIENT_ID` = your Spotify app client ID

Configured production redirect URI:

- `https://nexus-codebase.github.io/jammming/`

## Future Work

- Add support for searching by additional Spotify entities (albums, artists, playlists)
- Improve playlist editing (reorder tracks, duplicate detection hints)
- Add loading states/spinners and richer error messaging
- Migrate from implicit OAuth to Authorization Code with PKCE for stronger auth flow
- Add automated tests for components and Spotify utility methods
