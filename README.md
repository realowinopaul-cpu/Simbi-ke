# SIMBI KE — Kenyan PvP Maize-Toss Wagering Platform

## Project Overview

SIMBI KE is a full-stack web application offering a Kenya-exclusive PvP (player-vs-player) wagering game where users bet on the outcome of four maize-like structures tossed simultaneously. The platform supports M-Pesa and Airtel Money, handles up to 500,000 concurrent users, and operates on a 50-50 win probability with a 5-second match cycle.

## Key Features

- **Maize Toss Game**: Four binary objects (maize cobs) with 50-50 win probability
- **Real-time Matchmaking**: WebSocket-powered queue system with auto-matching
- **M-Pesa & Airtel Integration**: Seamless payment processing with 5% deposit VAT and 10% withdrawal fees
- **Scalable Architecture**: Supports 500,000 concurrent users
- **Secure Authentication**: JWT + OTP verification for Kenyan mobile numbers
- **Live Dashboard**: Queue positions, game history, real-time balance updates

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Socket.io
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: PostgreSQL (relational), Redis (queue/cache)
- **Authentication**: JWT, bcrypt, OTP via SMS
- **Deployment**: Docker, PM2

## Directory Structure

```
simbi-ke/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── database/
│   │   └── schema.sql
│   ├── .env.example
│   ├── package.json
│   ├── Dockerfile
│   └── server.js
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── styles/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
├── admin/
│   ├── pages/
│   ├── components/
│   └── package.json
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone and setup
git clone https://github.com/realowinopaul-cpu/simbi-ke.git
cd simbi-ke

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure .env with database credentials
npm run migrate
npm start

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Docker Deployment

```bash
docker-compose up -d
```

## API Documentation

See `backend/API.md` for complete endpoint documentation.

## Gaming Mechanics

### Win/Lose Logic (50-50 Probability)
- **WINNING** (8/16): 2W+2B (6 combos) + 4W (1 combo) + 4B (1 combo)
- **LOSING** (8/16): 3W+1B (4 combos) + 1W+3B (4 combos)

### Room Structure
- **Stake Range**: KES 10 to KES 20,000
- **Interval**: KES 40 increments
- **Formula**: `stake = 10 + (room_index × 40)`
- **Max Capacity**: 500 players per room
- **Match Duration**: 5 seconds per round

## Financial Model

- **Deposit VAT**: 5% deducted (e.g., KES 100 → KES 95 credited)
- **Withdrawal Fee**: 10% deducted (e.g., withdraw KES 1,000 → KES 900 received)
- **System Collection**: Withdrawal fees to M-Pesa 254708140269

## Security Features

- Kenya-only geolocation enforcement
- Phone number validation (254XXXXXXXXX format)
- 18+ age verification
- Cryptographically secure random outcomes
- Rate limiting on all APIs
- Anti-fraud device/IP tracking

## Branding Colors

- **Primary Yellow**: #F4C430
- **Kenyan Green**: #006600
- **Charcoal Black**: #1A1A1A
- **White**: #FFFFFF
- **Alert Red**: #CC0000

## Support

- **Help Desk**: +254 748 278 327 | +254 786 743 973
- **Social**: @SimbiKE (Twitter, Facebook, TikTok, Instagram)

## License

Proprietary — All rights reserved.

## Deployment Status

- [ ] Backend API deployment
- [ ] Frontend deployment
- [ ] Database migration
- [ ] M-Pesa integration
- [ ] Airtel Money integration
- [ ] Admin dashboard
- [ ] Production testing
