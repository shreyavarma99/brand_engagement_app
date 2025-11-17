# 🎮 BountyMap - Brand Engagement Bounty Platform (Demo)

A gamified web application where companies can post engagement bounties that users complete to earn rewards. This is a **frontend-only demo** with mock data.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the app**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎨 Features

- **Gamified Map View**: Interactive map with animated bounty markers
- **Mock Bounties**: Pre-loaded sample bounties to explore
- **Bounty Details**: Click on any bounty to see full details
- **Task Filters**: Filter bounties by task type
- **Pixel Art Styling**: Retro game-inspired UI

## 📝 Note

This is a demo version with no backend or authentication. All data is mock data stored in `frontend/src/data/mockBounties.ts`.

## 🗺️ Mapbox Setup

To use the map, you'll need a Mapbox token:
1. Sign up at [mapbox.com](https://www.mapbox.com)
2. Get your access token
3. Create `frontend/.env` with:
   ```
   VITE_MAPBOX_TOKEN=your_token_here
   ```

The app will work without a token but may have limited functionality.
