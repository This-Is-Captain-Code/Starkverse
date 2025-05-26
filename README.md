# Starkverse 🌟

**A blockchain-powered metaverse event platform built on Starknet**

Starkverse is a revolutionary platform where creators can host virtual metaverse events and users can participate in raffles to win exclusive access to virtual worlds. Built for the Starknet Hackathon: Re{ignite}, it combines the power of blockchain technology with immersive MetaHorizon experiences.

![Starkverse Platform](https://img.shields.io/badge/Platform-Starknet-purple?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Cairo-blue?style=for-the-badge)

## 🚀 Features

### 🎯 Core Platform Features
- **Event Creation & Management**: Creators can host virtual metaverse events with customizable entry requirements
- **Blockchain-Powered Raffles**: Fair and transparent raffle system using Starknet smart contracts
- **SP Token Economy**: Native ERC20-compatible points system for platform interactions
- **MetaHorizon Integration**: Seamless access to virtual worlds hosted on Meta Horizon Worlds

### 💎 SP Token Rewards System
- **Performance-Based Airdrops**: Earn 50-500 SP tokens based on event completion performance
- **Multiple Performance Levels**: 
  - 🏆 Legendary (90+ score): Up to 500 SP
  - ⭐ Excellent (80+ score): Up to 450 SP
  - 💎 Great (70+ score): Up to 400 SP
  - ✨ Good (60+ score): Up to 350 SP
- **One-Click Claiming**: Simple interface to claim earned rewards
- **Complete Reward History**: Track all completed events and claimed rewards

### 🎮 User Experience
- **Beautiful Dark Theme**: Metaverse-inspired design with purple/cyan gradients
- **Responsive Design**: Works seamlessly across all devices
- **Real-time Updates**: Live raffle status and winner notifications
- **Secure Authentication**: Powered by Replit Auth with session management

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **TailwindCSS** for modern styling
- **Wouter** for client-side routing
- **TanStack Query** for data fetching
- **Shadcn/ui** for beautiful components

### Backend
- **Node.js** with Express
- **PostgreSQL** database with Drizzle ORM
- **Passport.js** for authentication
- **Session-based auth** with secure storage

### Blockchain
- **Starknet** testnet deployment
- **Cairo** smart contracts for:
  - SP Token (ERC20-compatible)
  - Raffle System with verifiable randomness
  - Event completion tracking

### Infrastructure
- **Replit** for development and hosting
- **PostgreSQL** for data persistence
- **Replit Auth** for user authentication

## 📋 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/starkverse.git
cd starkverse
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
REPLIT_DOMAINS=your_replit_domain
REPL_ID=your_repl_id
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🎮 User Journey

### 1. **Registration & Welcome**
- Users sign up and receive 1000 SP welcome bonus
- Secure authentication via Replit Auth

### 2. **Event Discovery**
- Browse featured MetaHorizon events
- View event details, entry costs, and prize information

### 3. **Raffle Participation**
- Spend SP tokens to enter event raffles
- Fair, blockchain-verified winner selection

### 4. **Virtual World Access**
- Winners receive exclusive access URLs to MetaHorizon worlds
- Participate in immersive virtual experiences

### 5. **Performance Rewards**
- Complete events and receive performance scores
- Earn SP token airdrops based on achievement level
- Claim rewards to increase SP balance

## 🏗 Project Structure

```
starkverse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database connection
│   └── replitAuth.ts      # Authentication setup
├── contracts/              # Cairo smart contracts
│   ├── src/
│   │   ├── points_token.cairo    # SP Token contract
│   │   └── raffle_system.cairo  # Raffle logic contract
├── shared/                 # Shared types and schemas
└── public/                 # Static assets
```

## 🔧 API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - User logout
- `GET /api/auth/user` - Get current user

### Events & Raffles
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/raffle/:id/enter` - Enter raffle
- `GET /api/raffle/:id/winner` - Check winner status

### SP Rewards
- `GET /api/rewards/unclaimed` - Get unclaimed rewards
- `POST /api/rewards/:id/claim` - Claim reward
- `GET /api/rewards/history` - Reward history
- `POST /api/events/:id/complete` - Record event completion

### Dashboard
- `GET /api/dashboard/my-events` - User's created events
- `GET /api/dashboard/my-entries` - User's raffle entries

## 🎯 Sample Events

### StarkHouse
- **Platform**: Meta Horizon Worlds
- **Entry Cost**: 250 SP
- **Description**: Explore a futuristic blockchain-themed virtual house
- **URL**: https://horizon.meta.com/event/592351219996139

### Stark AI: Summer Agents
- **Platform**: Meta Horizon Worlds  
- **Entry Cost**: 500 SP
- **Description**: Interactive AI agents in a summer-themed virtual world
- **URL**: https://horizon.meta.com/event/1040440394210973

## 🏆 Hackathon Achievements

Built for **Starknet Hackathon: Re{ignite}**, Starkverse demonstrates:

- ✅ **Full-Stack dApp**: Complete web application with blockchain integration
- ✅ **Smart Contracts**: Cairo contracts deployed on Starknet testnet
- ✅ **Token Economy**: Custom SP token with real utility
- ✅ **User Experience**: Polished, production-ready interface
- ✅ **Real Integration**: Actual MetaHorizon world connectivity
- ✅ **Performance Incentives**: Reward system encouraging engagement

## 🔮 Future Roadmap

- **Mobile App**: Native iOS/Android applications
- **NFT Integration**: Event completion certificates as NFTs
- **Creator Economics**: Revenue sharing for event creators
- **Advanced Analytics**: Performance tracking and insights
- **Multi-Chain Support**: Expand beyond Starknet
- **Social Features**: User profiles and social interactions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Starknet Team** for the amazing blockchain infrastructure
- **Meta** for MetaHorizon Worlds platform integration
- **Replit** for development environment and authentication
- **Starknet Hackathon** organizers for the inspiration

---

**Built with ❤️ for the Starknet ecosystem**

*Connecting the metaverse through blockchain technology*