# Quick Setup Guide

## ✅ Installation Complete!

All dependencies have been installed successfully.

## 🔧 Configuration Required

Before running the application, you need to configure both the backend and frontend with your Cardano settings.

### Backend Configuration

1. Copy the environment template:
```bash
copy server\.env-example server\.env
```

2. Edit `server\.env` with your values:

**Required Settings:**
- `BLOCKFROST_PROJECT_ID` - Your Blockfrost API key from https://blockfrost.io
- `TREASURY_ADDRESS` - Your Cardano wallet address where users will send COKE tokens
- `COKE_POLICY_ID` - The policy ID of your COKE token
- `COKE_ASSET_NAME` - The asset name (e.g., "COKE")

**Example for Preprod Testing:**
```env
BLOCKFROST_PROJECT_ID=preprodABCD1234yourkey
BLOCKFROST_NETWORK=preprod
TREASURY_ADDRESS=addr_test1qz...yourpreprodaddress
COKE_POLICY_ID=abc123...yourpolicyid
COKE_ASSET_NAME=COKE
START_LAB_PRICE=1000000
BASE_POWER=100
EMISSION_PER_SECOND=0.5
HALVING_INTERVAL_SECONDS=1209600
GENESIS_TIMESTAMP=1704067200
PORT=8787
```

### Frontend Configuration

1. Copy the environment template:
```bash
copy web\.env-example web\.env.local
```

2. Edit `web\.env.local` with your values:

**Required Settings:**
- `VITE_BLOCKFROST_API_URL` - Blockfrost API URL (preprod or mainnet)
- `VITE_BLOCKFROST_API_KEY` - Your Blockfrost API key
- `VITE_NETWORK` - "Preprod" or "Mainnet"
- `VITE_COKE_POLICY_ID` - Same as backend
- `VITE_COKE_ASSET_NAME` - Same as backend

**Example for Preprod Testing:**
```env
VITE_BLOCKFROST_API_URL=https://cardano-preprod.blockfrost.io/api/v0
VITE_BLOCKFROST_API_KEY=preprodABCD1234yourkey
VITE_API_BASE=http://localhost:8787
VITE_NETWORK=Preprod
VITE_COKE_POLICY_ID=abc123...yourpolicyid
VITE_COKE_ASSET_NAME=COKE
VITE_MIN_ADA_FOR_TREASURY=2000000
```

## 🚀 Running the Application

### Option 1: Run Both Services Together

```bash
npm run dev
```

This will start both backend (port 8787) and frontend (port 5173) simultaneously.

### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev:web
```

## 🧪 Testing

1. **Get Test Tokens:**
   - Get test ADA from Cardano Preprod Faucet: https://docs.cardano.org/cardano-testnet/tools/faucet
   - Mint test COKE tokens on Preprod for testing

2. **Install a CIP-30 Wallet:**
   - Nami: https://namiwallet.io
   - Eternl: https://eternl.io
   - Lace: https://lace.io

3. **Connect and Test:**
   - Open http://localhost:5173
   - Connect your wallet
   - Ensure you have COKE tokens
   - Click "Start Lab" to activate
   - Watch your rewards accumulate!

## 📝 Important Notes

### For Development
- The backend uses `sql.js` (pure JavaScript SQLite) - no compilation needed
- Database file is saved to `server/coke-lab.db`
- Auto-saves every 5 seconds
- Frontend uses Blockfrost for protocol parameters only

### For Production
1. **Security:**
   - Move Blockfrost calls to backend only
   - Use HTTPS
   - Add rate limiting
   - Backup database regularly

2. **Deployment:**
   - Deploy backend to a VPS/cloud service
   - Deploy frontend to Vercel/Netlify
   - Update `.env` files with production values
   - Use mainnet Blockfrost keys

3. **Treasury Wallet:**
   - Use a cold wallet for production
   - The server only verifies transactions, never needs private keys
   - Monitor incoming COKE payments regularly

## 🔍 Troubleshooting

### Backend won't start
- Check that `server/.env` exists and has all required values
- Verify Blockfrost API key is valid
- Check port 8787 is not already in use

### Frontend won't start
- Check that `web/.env.local` exists and has all required values
- Verify Blockfrost API key is valid
- Check port 5173 is not already in use

### Wallet won't connect
- Ensure you have a CIP-30 compatible wallet installed
- Check that the wallet extension is enabled
- Try refreshing the page

### Transaction verification fails
- Wait a few seconds for transaction to be confirmed on-chain
- Check Blockfrost API key has correct permissions
- Verify treasury address is correct
- Ensure you sent enough COKE tokens (default: 1,000,000)

## 📚 Next Steps

1. **Customize Game Parameters:**
   - Edit emission rates in `server/.env`
   - Adjust halving intervals
   - Change activation costs

2. **Add Features:**
   - Implement upgrades/boosters
   - Add leaderboard UI
   - Create admin dashboard
   - Add on-chain claims

3. **Deploy to Production:**
   - Test thoroughly on Preprod first
   - Configure mainnet settings
   - Set up monitoring and backups
   - Launch and promote!

## 🎉 You're Ready!

Once you've configured the `.env` files, run `npm run dev` to start the application.

Check the main README.md for detailed documentation on features, API endpoints, and customization options.

