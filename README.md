# Staq — Live Stock Market Dashboard

A full-stack real-time stock market dashboard built with React, TypeScript, and Node.js. Staq lets you track live prices, view interactive candlestick charts, read company news, and filter your watchlist by Shariah compliance — all with no API key required.

**Live Demo:** https://sanihaseeb.github.io/stock-app/

---

## Author

**Sani Haseeb**
- GitHub: [@sanihaseeb](https://github.com/sanihaseeb)
- LinkedIn: [linkedin.com/in/sani-haseeb](https://linkedin.com/in/sani-haseeb)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Overview

Staq is a real-time financial dashboard that proxies Yahoo Finance data through a lightweight Node.js backend, broadcasting live price updates to all connected clients over WebSocket. The frontend is built entirely in React 19 with TypeScript, uses Recharts for interactive candlestick and line charts, and features a unique Shariah compliance filter based on AAOIFI and DJIMI screening criteria — a feature not commonly found in open-source dashboards.

The backend uses Yahoo Finance's undocumented chart API (no API key, no rate limits) and caches quotes in-memory to handle burst traffic gracefully. A WebSocket server pushes price updates to all connected clients every few seconds, keeping every browser tab in sync without polling.

---

## Features

### Market Data
- Live price tracking for 10 default symbols: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, AMD, NFLX, JPM
- Real-time ticker tape scrolling across the top with live prices and percentage changes
- Market summary bar showing total gainers, losers, and average change across the watchlist
- Per-stock data: current price, open, high, low, previous close, change, and change %

### Charts & Analysis
- Interactive candlestick and line charts via Recharts with multiple timeframe resolutions (1D, 1W, 1M, 3M, 1Y)
- Company profile: sector, industry, exchange, market cap, description
- Latest company news pulled from Yahoo Finance RSS

### Search
- Symbol search across all listed stocks
- Results update instantly as you type
- Click any result to load the full detail view

### Shariah Compliance Filter
- Toggle to filter the watchlist to Shariah-compliant stocks only
- Screening based on AAOIFI and Dow Jones Islamic Market Index (DJIMI) criteria:
  - Business activity: excludes conventional banking/insurance, alcohol, tobacco, weapons, gambling, adult content, pork
  - Financial ratios: total debt / market cap < 33%, interest income / revenue < 5%
- Each stock card shows a compliance badge: Compliant, Non-Compliant, Doubtful, or Unknown

### Real-Time Updates
- WebSocket connection from backend to all connected browser clients
- Prices update automatically without any manual refresh
- Connection status indicator shown in the header

### UX
- Fully responsive — works on desktop and mobile
- Dark theme throughout
- Stock cards show a mini progress bar indicating price movement direction
- Mobile view collapses the watchlist into a full-screen detail view on selection

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool and dev server |
| Recharts | Candlestick and line charts |
| Lucide React | Icon library |
| WebSocket (native) | Real-time price sync |
| CSS (custom) | Dark theme, responsive layout |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| ws (WebSocket) | Real-time broadcast to clients |
| axios | Proxy requests to Yahoo Finance |
| In-memory cache (Map) | Quote caching to handle burst traffic |
| Yahoo Finance Chart API | No-key, no-rate-limit market data source |

### Infrastructure
| Service | Purpose |
|---|---|
| GitHub Pages | Frontend hosting |
| Render / Railway | Backend hosting |

---

## Architecture

```
┌──────────────────────────────────────────┐
│           GitHub Pages (Client)          │
│         React + Vite + TypeScript        │
│                                          │
│  Ticker ─── StockCard ─── StockDetail   │
│               │                │         │
│           Watchlist         Chart        │
│           (WebSocket)       (Recharts)   │
└──────────────────┬───────────────────────┘
                   │ HTTP + WSS
┌──────────────────▼───────────────────────┐
│         Render / Railway (Server)        │
│           Express + ws + Node.js         │
│                                          │
│  REST API        WebSocket Server        │
│  ├── /api/status     broadcasts quotes   │
│  ├── /api/quotes     every N seconds     │
│  ├── /api/quote/:s   to all clients      │
│  ├── /api/candles/:s                     │
│  ├── /api/profile/:s                     │
│  ├── /api/search                         │
│  └── /api/news/:s                        │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│        Yahoo Finance (External)          │
│  chart API · search API · news feed      │
│  No API key required · No rate limits    │
└──────────────────────────────────────────┘
```

---

## Project Structure

```
stock-market-app/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chart.tsx          # Recharts candlestick / line chart
│   │   │   ├── Search.tsx         # Symbol search with live results
│   │   │   ├── ShariahBadge.tsx   # Compliance status badge
│   │   │   ├── StockCard.tsx      # Watchlist card with mini chart bar
│   │   │   ├── StockDetail.tsx    # Full detail panel (chart, news, profile)
│   │   │   └── Ticker.tsx         # Scrolling live price ticker tape
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts    # WebSocket hook with auto-reconnect
│   │   ├── utils/
│   │   │   ├── api.ts             # All fetch helpers (quotes, candles, search)
│   │   │   └── shariahData.ts     # AAOIFI/DJIMI compliance dataset
│   │   ├── types.ts               # TypeScript interfaces (Quote, Candle, etc.)
│   │   └── App.tsx                # Root component, layout, state management
│   ├── vite.config.ts
│   └── package.json
│
└── server/
    └── src/
        └── index.js               # Express server + WebSocket broadcast
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/sanihaseeb/stock-app.git
cd stock-app
npm install
cd client && npm install
cd ../server && npm install
```

### Running locally

```bash
# From the root — starts both client and server with concurrently
npm run dev
```

The client runs at `http://localhost:5173` and the server at `http://localhost:3001`.

### Environment variables

The server reads the backend port from:

```env
PORT=3001
```

The client reads the backend URL from:

```env
VITE_API_URL=http://localhost:3001
```

For production, set `VITE_API_URL` to your Render/Railway domain before building.

---

## API Reference

All endpoints are served by the Express backend at `http://localhost:3001`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/status` | Health check — returns `{ apiKeySet: true }` |
| GET | `/api/quotes?symbols=AAPL,MSFT` | Batch quote fetch for given symbols |
| GET | `/api/quote/:symbol` | Single quote for one symbol |
| GET | `/api/candles/:symbol?resolution=D` | OHLC candle data (1D, 1W, 1M, 3M, 1Y) |
| GET | `/api/profile/:symbol` | Company name, sector, industry, description |
| GET | `/api/search?q=apple` | Symbol search — returns matching tickers |
| GET | `/api/news/:symbol` | Latest news articles for a symbol |

### WebSocket

Connect to `ws://localhost:3001`. The server pushes a JSON array of quote objects every few seconds:

```json
[
  {
    "symbol": "AAPL",
    "price": 189.45,
    "change": 1.23,
    "changePercent": 0.65,
    "open": 188.10,
    "high": 190.20,
    "low": 187.80,
    "prevClose": 188.22,
    "timestamp": 1710000000000
  }
]
```

---

## Deployment

### Frontend → GitHub Pages

```bash
cd client
npm run deploy
```

This runs `vite build` then `gh-pages -d dist`, pushing the built output to the `gh-pages` branch. The live URL is `https://sanihaseeb.github.io/stock-app/`.

### Backend → Render

1. Connect the repo on [render.com](https://render.com)
2. Set **Root Directory** to `server`
3. **Build command:** `npm install`
4. **Start command:** `node src/index.js`
5. Set `VITE_API_URL` in the client `.env.production` to the Render domain

---

## License

MIT
