# SIMBI KE — Kenyan PvP Maize-Toss Wagering Platform

## Overview
SIMBI KE is a Kenya-exclusive, real-time multiplayer wagering game where players bet on the outcome of four maize-like structures tossed simultaneously. Features M-Pesa and Airtel Money integration, supports 500,000 concurrent users, and operates on a 50-50 win probability with a 5-second match cycle.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose

### Installation
```bash
# Clone repository
git clone https://github.com/realowinopaul-cpu/simbi-ke.git
cd simbi-ke

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start with Docker
docker-compose up -d

# Run migrations
npm run migrate

# Seed data
npm run seed

# Start development
npm run dev
```

## Project Structure
```
simbi-ke/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── tests/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── docs/
├── docker-compose.yml
├── .env.example
└── package.json
```

## Features
- ✅ Real-time PvP maize toss game mechanics
- ✅ M-Pesa & Airtel Money payment integration
- ✅ Queue & matchmaking system (500 players per room)
- ✅ User authentication with OTP verification
- ✅ Game history & transaction tracking
- ✅ Admin dashboard
- ✅ Geolocation & Kenya-only enforcement
- ✅ WebSocket real-time updates
- ✅ Responsive mobile design

## Environment Variables
See `.env.example` for required configuration:
- Database credentials
- Redis connection
- M-Pesa & Airtel Money sandbox keys
- JWT secret
- SMS gateway credentials

## API Documentation
See `docs/API.md` for comprehensive endpoint documentation.

## Game Mechanics

### The Maize Toss
- 4 binary maize structures (Black/White sides)
- 16 possible outcomes (50% win, 50% loss)
- **Win Conditions:** 2W+2B, 4W+0B, 0W+4B
- **Lose Conditions:** 3W+1B, 1W+3B

### Stake Rooms
- Min: KES 10 | Max: KES 20,000
- Arithmetic progression: `10 + (room_index × 40)`
- Auto-bet: Stay in queue for up to 10 rounds
- FCFS queue with max 500 players per room

## Testing
```bash
npm run test
npm run test:coverage
```

## Deployment
```bash
docker build -t simbi-ke:latest .
docker push simbi-ke:latest
# Configure K8s or AWS ECS
```

## Security
- HTTPS/TLS enforced
- JWT token authentication
- Geolocation validation (Kenya IP)
- Phone number validation (Kenyan format)
- Anti-fraud detection
- Rate limiting on all APIs
- Secure random number generation (server-side)

## Support
- **Help Desk:** +254 748 278 327 | +254 786 743 973
- **Social:** @SimbiKE (Twitter, Facebook, TikTok, Instagram)
- **Email:** support@simbike.ke

## License
Propretary. All rights reserved.

## Author
Developed for SIMBI KE Ltd.
