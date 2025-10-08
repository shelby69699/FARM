# 🧪 Coke Lab dApp

A complete Cardano dApp modeled after the addicted.fun gameplay loop. Users stake COKE tokens to activate their lab, earn continuous rewards based on grow power, and participate in a global emission system with halving events.

## 🎯 Features

- **CIP-30 Wallet Connect**: Support for Nami, Eternl, Flint, Lace, and other CIP-30 wallets
- **On-chain Verification**: Blockfrost-powered verification of COKE token payments
- **Game Engine**: Off-chain grow power, network share, emission rates, and halving mechanics
- **Real-time Dashboard**: Live stats showing pending rewards, power, and network share
- **Claim System**: Off-chain reward settlement (easily extensible to on-chain)
- **Leaderboard**: Track top performers by total claimed rewards

## 📁 Project Structure

```
coke-lab-dapp/
├── web/                    # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Lucid utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Express backend (SQLite + Blockfrost)
│   ├── src/
│   │   ├── index.js       # Express app & API routes
│   │   ├── db.js          # SQLite database setup
│   │   ├── blockfrost.js  # On-chain verification
│   │   ├── game.js        # Game engine logic
│   │   └── config.js      # Environment config
│   ├── package.json
│   └── .env-example
│
├── package.json           # Root scripts (run both services)
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Cardano wallet with CIP-30 support (Nami, Eternl, etc.)
- Blockfrost API key ([Get one here](https://blockfrost.io))
- COKE tokens for testing (on Preprod or Mainnet)

### Installation

1. **Clone or extract this repository**

2. **Install all dependencies**

```bash
npm run install:all
```

Or install individually:

```bash
npm --prefix server install
npm --prefix web install
```

### Configuration

#### Backend (.env)

Create `server/.env` from the example:

```bash
# Copy the example
cp server/.env-example server/.env
```

Edit `server/.env` with your values:

```env
# Blockfrost configuration
BLOCKFROST_PROJECT_ID=preprodYourProjectIdHere
BLOCKFROST_NETWORK=preprod

# Treasury wallet address (where users send COKE tokens)
TREASURY_ADDRESS=addr_test1qz...youraddresshere

# COKE Token details
COKE_POLICY_ID=your_policy_id_here
COKE_ASSET_NAME=COKE

# Game parameters
START_LAB_PRICE=1000000
BASE_POWER=100
EMISSION_PER_SECOND=0.5
HALVING_INTERVAL_SECONDS=1209600
GENESIS_TIMESTAMP=1704067200

# Server configuration
PORT=8787
```

**Important fields:**
- `BLOCKFROST_PROJECT_ID`: Your Blockfrost API key
- `BLOCKFROST_NETWORK`: `preprod` for testing, `mainnet` for production
- `TREASURY_ADDRESS`: Your project's treasury wallet address
- `COKE_POLICY_ID`: The policy ID of your COKE token
- `COKE_ASSET_NAME`: The asset name (usually "COKE")
- `GENESIS_TIMESTAMP`: When emissions started (Unix timestamp)

#### Frontend (.env.local)

Create `web/.env.local` from the example:

```bash
# Copy the example
cp web/.env-example web/.env.local
```

Edit `web/.env.local`:

```env
# Blockfrost configuration
VITE_BLOCKFROST_API_URL=https://cardano-preprod.blockfrost.io/api/v0
VITE_BLOCKFROST_API_KEY=preprodYourProjectIdHere

# Backend API
VITE_API_BASE=http://localhost:8787

# Network configuration
VITE_NETWORK=Preprod

# COKE Token details
VITE_COKE_POLICY_ID=your_policy_id_here
VITE_COKE_ASSET_NAME=COKE

# Transaction parameters
VITE_MIN_ADA_FOR_TREASURY=2000000
```

**Important fields:**
- `VITE_BLOCKFROST_API_URL`: Use preprod or mainnet URL
- `VITE_BLOCKFROST_API_KEY`: Your Blockfrost API key (for protocol params)
- `VITE_NETWORK`: `Preprod` or `Mainnet`
- `VITE_COKE_POLICY_ID`: Same as backend
- `VITE_MIN_ADA_FOR_TREASURY`: Minimum ADA to send with tokens (2 ADA default)

### Running the Application

#### Option 1: Run both services together (recommended)

```bash
npm run dev
```

This uses `concurrently` to run both backend and frontend simultaneously.

#### Option 2: Run services separately

Terminal 1 (Backend):
```bash
npm run dev:server
# or
npm --prefix server run dev
```

Terminal 2 (Frontend):
```bash
npm run dev:web
# or
npm --prefix web run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8787
- **Health Check**: http://localhost:8787/health

## 🎮 How to Use

1. **Connect Wallet**: Click "Connect Wallet" and select your CIP-30 wallet
2. **Check Balance**: Verify you have enough COKE tokens (default: 1,000,000)
3. **Start Lab**: Click "Start Lab" to send COKE tokens to the treasury
4. **Wait for Confirmation**: Transaction will be verified on-chain via Blockfrost
5. **View Dashboard**: See your grow power, pending rewards, and network share
6. **Claim Rewards**: Click "Claim" to settle your pending rewards

## 🔧 API Endpoints

### GET `/api/config`
Returns public configuration (network, treasury address, token details, game params)

### POST `/api/start`
Activates a user's lab after verifying COKE payment on-chain

**Body:**
```json
{
  "address": "addr1...",
  "txHash": "abc123..."
}
```

### GET `/api/state/:address`
Get current state of a user's lab (power, pending, share, etc.)

### POST `/api/claim`
Claim pending rewards

**Body:**
```json
{
  "address": "addr1..."
}
```

### GET `/api/leaderboard`
Get top farms by total claimed (query param: `limit=10`)

### GET `/api/stats`
Get global statistics (total farms, power, claimed, pending)

### GET `/health`
Health check endpoint

## 🎯 Game Mechanics

### Grow Power
- Base power assigned on lab activation (default: 100)
- Determines your share of global emissions
- Can be extended with upgrades/boosters

### Emissions
- Global emission rate (default: 0.5 COKE/second)
- Distributed proportionally based on power
- Halves every interval (default: 14 days)

### Network Share
```
Your Share = (Your Power / Total Network Power) × 100%
```

### Reward Calculation
```
Rewards per Second = Your Power × Current Emission Rate
```

The game engine correctly handles halving boundaries, so even if you don't claim for weeks, your rewards are accurately calculated across multiple halving events.

## 🔐 Security Notes

### For Development
- Blockfrost API keys are used in both frontend and backend
- Frontend uses Blockfrost only for protocol parameters
- Backend uses Blockfrost for transaction verification

### For Production
1. **Proxy Blockfrost calls**: Move all Blockfrost calls to backend to hide API keys
2. **Treasury Security**: Use a cold wallet for the treasury; the server only verifies, never spends
3. **Rate Limiting**: Add rate limiting to API endpoints
4. **Input Validation**: Add comprehensive input validation and sanitization
5. **HTTPS**: Use HTTPS in production (deploy behind nginx/cloudflare)
6. **Database Backups**: Regularly backup `server/coke-lab.db`

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd web
npm run build
# Deploy the 'dist' folder
```

Update `.env.local` with production values before building.

### Backend (VPS/Railway/Render)
```bash
cd server
npm start
```

Make sure to set all environment variables in your hosting platform.

### Database
The SQLite database (`server/coke-lab.db`) is created automatically. For production, consider:
- Regular backups
- Migrating to PostgreSQL for better concurrency
- Using a managed database service

## 🎨 Customization

### Change Token Requirements
Edit `server/.env`:
```env
START_LAB_PRICE=2000000  # Change to 2M COKE
```

### Change Emission Rate
Edit `server/.env`:
```env
EMISSION_PER_SECOND=1.0  # Double the emission
```

### Change Halving Interval
Edit `server/.env`:
```env
HALVING_INTERVAL_SECONDS=604800  # 7 days instead of 14
```

### Add Upgrades/Boosters
Extend the backend with new endpoints:
```javascript
// server/src/index.js
app.post('/api/upgrade', async (req, res) => {
  // Verify COKE payment for upgrade
  // Increase farm.base_power
});
```

### On-chain Claims
Replace the off-chain claim logic with actual token minting/sending:
```javascript
// Use Lucid on backend to mint/send reward tokens
```

## 📊 Database Schema

### `farms` table
- `address` (TEXT, PRIMARY KEY): User's wallet address
- `base_power` (INTEGER): Grow power
- `total_claimed` (REAL): Total rewards claimed
- `pending` (REAL): Pending rewards (updated on claim)
- `last_claim_timestamp` (INTEGER): Last claim time
- `activated_at` (INTEGER): Lab activation time
- `created_at` (INTEGER): Record creation time

### `payments` table
- `id` (INTEGER, PRIMARY KEY)
- `address` (TEXT): User's wallet address
- `tx_hash` (TEXT, UNIQUE): Transaction hash
- `amount` (INTEGER): COKE amount sent
- `verified` (BOOLEAN): Verification status
- `verified_at` (INTEGER): Verification time
- `created_at` (INTEGER): Record creation time

## 🧪 Testing

### Preprod Testing
1. Get test ADA from [Preprod Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
2. Mint test COKE tokens on Preprod
3. Configure both `.env` files for Preprod
4. Test the full flow

### Mainnet Deployment
1. Test thoroughly on Preprod first
2. Update all `.env` files to Mainnet
3. Use real COKE token policy ID
4. Set genesis timestamp to your mainnet launch time
5. Deploy backend first, then frontend

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucid Cardano** - Cardano transaction library

### Backend
- **Express** - Web framework
- **better-sqlite3** - Database
- **Blockfrost API** - Cardano blockchain data
- **Node.js 18+** - Runtime

## 📝 License

This project is provided as a template for building Cardano dApps. Feel free to customize and use it for your own projects.

## 🤝 Contributing

This is a template project. Fork it and make it your own!

## 💡 Extending the dApp

### Ideas for Enhancement
1. **NFT Integration**: Require special NFTs to access premium features
2. **Boosters**: Sell power boosts for COKE tokens
3. **Referral System**: Reward users for bringing in new labs
4. **Leaderboard Rewards**: Distribute bonuses to top performers
5. **Social Features**: Chat, alliances, team competitions
6. **On-chain Governance**: Let COKE holders vote on parameters
7. **Mobile App**: Build React Native version
8. **Analytics Dashboard**: Track emissions, users, growth over time

---

**Built with ❤️ on Cardano**

For questions or issues, check the code comments or review the Lucid and Blockfrost documentation.

