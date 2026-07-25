# SIMBI KE

🌾 **A modern maize toss gaming platform for Kenyans** 🎮

> Where tradition meets technology: Experience the classic maize toss (Dondo) game in a digital revolution.

---

## 🎯 Overview

SIMBI KE is a real-time, online gaming platform built on Kenya's cultural tradition of maize tossing. Users compete in 1v1 matches with instant results, secure payments via M-Pesa & Airtel Money, and a vibrant community of players.

### Key Features

✅ **User Authentication**
- Phone number + OTP registration
- Secure JWT-based sessions
- Remember me functionality

✅ **Real-Time Gaming**
- Live queue system (FCFS matching)
- Instant maize toss results
- 50-50 probability validation
- WebSocket real-time updates

✅ **Payment Integration**
- M-Pesa STK Push
- Airtel Money API
- Instant deposits & withdrawals
- Transaction history

✅ **Player Profiles**
- Stats tracking (wins, losses, balance)
- Game history
- Leaderboards

✅ **Admin Dashboard**
- System statistics
- Fraud detection
- User management
- Transaction monitoring

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

```bash
# Clone repository
git clone https://github.com/realowinopaul-cpu/simbi-ke.git
cd simbi-ke

# Setup with Docker
docker-compose up -d

# Verify services
docker-compose ps
```

Access:
- 🎮 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:5000
- 🗄️ PostgreSQL: localhost:5432
- 💾 Redis: localhost:6379

### Manual Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 📁 Project Structure

```
simbi-ke/
├── backend/                 # Express.js API
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── models/             # Database schemas
│   ├── middleware/         # Auth, validation, etc.
│   ├── utils/              # Helpers & crypto
│   └── server.js           # Entry point
├── frontend/               # Next.js application
│   ├── pages/             # React pages
│   ├── components/        # Reusable components
│   ├── utils/             # API client, helpers
│   ├── styles/            # Tailwind CSS
│   └── public/            # Static assets
├── docker-compose.yml      # Docker orchestration
├── API.md                  # API documentation
├── DEPLOYMENT.md           # Deployment guide
└── ROADMAP.md             # Feature roadmap
```

---

## 🎮 How It Works

### Game Flow

1. **User Registration** → OTP verification → Login
2. **Deposit Funds** → M-Pesa/Airtel payment → Instant credit
3. **Join Queue** → Real-time position tracking → Auto-matching
4. **Play Match** → Roller tosses maize → Instant result
5. **Withdraw** → 10% fee deducted → Funds transferred

### Win Logic (50-50 Probability)

Four maize cobs are tossed:
- **WHITE side = Wins** (2W+2B, 4W = 50% chance)
- **BLACK side = Loses** (4B = 50% chance)
- **Instant payout** based on stake

---

## 💻 Technology Stack

### Backend
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Real-time**: Socket.IO (WebSockets)
- **Payment**: M-Pesa API, Airtel Money API
- **Auth**: JWT, bcrypt
- **Validation**: Joi, Express-validator

### Frontend
- **Framework**: Next.js 13
- **UI**: React 18 with Tailwind CSS
- **State**: Zustand
- **HTTP**: Axios
- **Animation**: Framer Motion
- **Notifications**: React Hot Toast
- **Real-time**: Socket.IO client

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Monitoring**: (TBD)

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Gaming
- `GET /api/game/rooms` - List available rooms
- `POST /api/game/join-queue` - Join queue
- `POST /api/game/toss` - Toss result
- `GET /api/game/history` - Game history

### Payments
- `POST /api/payment/deposit` - Initiate deposit
- `POST /api/payment/withdraw` - Initiate withdrawal
- `GET /api/payment/history` - Transaction history

See [API.md](API.md) for full documentation.

---

## 🔐 Security

✓ JWT authentication (30 min expiry)
✓ Password hashing (bcrypt, 12 rounds)
✓ Rate limiting (login, API endpoints)
✓ CSRF protection
✓ CORS validation
✓ SQL injection prevention (prepared statements)
✓ Input validation & sanitization
✓ SSL/TLS encryption
✓ Fraud detection & monitoring

---

## 📈 Performance

**Targets:**
- 500K concurrent users
- < 200ms API response (p95)
- < 100ms WebSocket latency
- < 2s page load time
- 5-second match completion

**Optimizations:**
- Redis caching for rooms & leaderboards
- Database indexing on hot queries
- Connection pooling
- Gzip compression
- CDN for static assets

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

---

## 📚 Documentation

- [API Documentation](API.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Development Roadmap](ROADMAP.md)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

**Help & Support:**
- 📱 Primary: +254 748 278 327
- 📱 Secondary: +254 786 743 973
- 💬 In-app chat support
- 📧 Email: support@simbi-ke.com

---

## ⚖️ Legal & Compliance

🚨 **Disclaimer**: This is a demonstration platform. Ensure compliance with Kenya's gaming regulations before production deployment.

- Age restriction: 18+
- Responsible gaming features
- Regular compliance audits
- User data protection (GDPR-like)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**Paul Owinoh**
- GitHub: [@realowinopaul-cpu](https://github.com/realowinopaul-cpu)
- Email: realowinopaul@gmail.com

---

<div align="center">

**Made with ❤️ for Kenya 🇰🇪**

⭐ Star us on GitHub!

</div>
