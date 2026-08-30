# MidnightPlay TV & Web

A production-grade cinematic streaming web application inspired by modern OTT platforms such as Netflix, optimized for **Smart TV browsers (Samsung Tizen, LG webOS, Android TV)**, **Desktop (4K HDR)**, and **Mobile/Tablet**.

---

## Key Features

- **TV & D-Pad Spatial Navigation Engine**:
  - Full remote control & keyboard support (`Arrow Keys`, `Enter / OK`, `Escape / Back`).
  - High-visibility TV glow outline and scaling on focus.
  - Automatic smooth row scrolling when navigating horizontal content rows.
  - Position memory: returning from a Details modal or Player restores exact focus to the previously selected card.
  - Zero focus traps with cross-platform Smart TV key code mapping (Tizen `10009`, webOS `461`, Android TV `8`).
  - Virtual On-Screen Smart TV Remote widget for desktop and mobile testing.
- **Cinematic Homepage & Hero**:
  - Full-bleed 4K backdrop video preview with seamless mute/unmute toggle.
  - Match %, age ratings, 4K Ultra HD & Dolby Atmos badges.
  - Action buttons: *Play Now*, *More Info*, *Add to My List*.
- **Content Carousels & Rows**:
  - *Continue Watching* (with saved timestamp and progress bar persistence).
  - *Top 10 Streaming Today* with large rank typography.
  - *Trending Now*, *Blockbuster Movies*, *Binge-Worthy TV Series*, *Sci-Fi & Cyberpunk*, *Anime*, *Documentaries*.
- **Movie & Show Details Page**:
  - Rich metadata, cast, creators, synopsis, and genre tags.
  - TV series season & episode switcher with preview thumbnails and direct episode playback.
  - "More Like This" recommendations grid.
- **Full HTML5 Video Player**:
  - Fullscreen, custom sleek playback HUD, scrubbing timeline, 10s jump, volume control.
  - Subtitle track switching (English CC, Spanish, French, Japanese, Off).
  - Audio track selection (Dolby Atmos 5.1, Spanish, French, Japanese, German).
  - In-player episode switcher drawer for TV series.
  - Up Next Episode countdown overlay.
  - Auto-hiding HUD after 3.8s with instant D-pad wake-up.
- **Search & Discovery**:
  - Instant live filtering by title, actor, genre, director, or keyword.
  - Category filter pills with D-pad navigation.
- **Personal Watchlist & Continue Watching**:
  - Persisted locally with structured TypeScript data models ready for backend / Supabase / Firebase / TMDB sync.
- **Profiles & TV Settings**:
  - Multi-profile switching (Alex, Sarah, Kids Zone, Cinema 4K).
  - TV Safe Area (overscan) compensation slider (0–5%).
  - Autoplay next episode toggle.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## Vercel Deployment

This project is built to deploy out of the box to Vercel as a performant static / SPA deployment:

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Keep default settings:
   - **Framework Preset**: Vite / Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

---

## Keyboard & Remote Navigation Cheatsheet

| Button | Key / Action |
|---|---|
| **D-Pad Up / Down / Left / Right** | `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| **Select / Play / OK** | `Enter` or `Space` |
| **Back / Exit Player / Close Modal** | `Escape` or `Backspace` (Tizen / webOS Back) |
| **Player Seek 10s** | `ArrowLeft` (Rewind 10s), `ArrowRight` (Forward 10s) |
| **Fullscreen Toggle** | `F` |
| **Mute / Unmute** | `M` |
