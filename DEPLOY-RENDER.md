# 🚀 Deploy to Render Guide

## Step 1: Create GitHub Repository (Do this first!)

1. Go to https://github.com/new
2. Repository name: `coke-lab-dapp` (or your choice)
3. Make it **Public** or **Private** (both work with Render)
4. **DO NOT** initialize with README (we already have files)
5. Click "Create repository"

## Step 2: Push to GitHub

After creating the repo, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/coke-lab-dapp.git
git branch -M main
git push -u origin main
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/coke-lab-dapp.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy Backend to Render

### A. Create New Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select the `coke-lab-dapp` repository
5. Configure:

**Basic Settings:**
- **Name:** `coke-lab-backend` (or your choice)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Free tier is fine to start

### B. Add Environment Variables

In the "Environment" section, add these variables:

```
BLOCKFROST_PROJECT_ID=mainnetRphtobeMUfaH1ulbeDPsDntux1ESWh9r
BLOCKFROST_NETWORK=mainnet
TREASURY_ADDRESS=addr1qyv4kvd3hehh8dpqzl070qgaysrszvch6faze32mfrxnj6w50cuvnfnqdl9lwu02js3luplfsglenstt3lnkch23ggyq7ds25g
COKE_POLICY_ID=YOUR_ACTUAL_POLICY_ID
COKE_ASSET_NAME=COKE
START_LAB_PRICE=1000000
BASE_POWER=100
EMISSION_PER_SECOND=0.5
HALVING_INTERVAL_SECONDS=1209600
GENESIS_TIMESTAMP=1704067200
PORT=8787
```

**IMPORTANT:** Update `COKE_POLICY_ID` with your actual token policy ID!

### C. Deploy

Click **"Create Web Service"**

Render will:
- Clone your repo
- Install dependencies
- Start the server
- Give you a URL like: `https://coke-lab-backend.onrender.com`

## Step 4: Deploy Frontend to Render

### A. Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Select the same `coke-lab-dapp` repository
3. Configure:

**Basic Settings:**
- **Name:** `coke-lab-frontend` (or your choice)
- **Branch:** `main`
- **Root Directory:** `web`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### B. Add Environment Variables

Add these in the "Environment" section:

```
VITE_BLOCKFROST_API_URL=https://cardano-mainnet.blockfrost.io/api/v0
VITE_BLOCKFROST_API_KEY=mainnetRphtobeMUfaH1ulbeDPsDntux1ESWh9r
VITE_API_BASE=https://coke-lab-backend.onrender.com
VITE_NETWORK=Mainnet
VITE_COKE_POLICY_ID=YOUR_ACTUAL_POLICY_ID
VITE_COKE_ASSET_NAME=COKE
VITE_MIN_ADA_FOR_TREASURY=2000000
```

**IMPORTANT:** 
- Update `VITE_API_BASE` with your actual backend URL from Step 3
- Update `VITE_COKE_POLICY_ID` with your actual token policy ID

### C. Deploy

Click **"Create Static Site"**

You'll get a URL like: `https://coke-lab-frontend.onrender.com`

## Step 5: Update Backend CORS (Important!)

After frontend is deployed, update your backend environment variables to allow CORS:

1. Go to your backend service on Render
2. Add environment variable:
```
CORS_ORIGIN=https://coke-lab-frontend.onrender.com
```

3. Redeploy the backend

## Step 6: Test Production

1. Visit your frontend URL
2. Connect wallet
3. Check COKE balance
4. Activate lab (send real COKE!)
5. Verify rewards accumulate
6. Test claim

## 🔧 Render Configuration Tips

### Free Tier Limitations
- Backend spins down after 15 min of inactivity
- First request after sleep takes 30+ seconds
- 750 hours/month free
- Consider upgrading to paid tier for production

### Database Persistence
- SQLite database on Render is NOT persistent on free tier
- For production, options:
  1. Upgrade to paid tier with persistent disk
  2. Use external PostgreSQL (recommended)
  3. Use Render's PostgreSQL add-on

### Monitoring
- Check logs in Render dashboard
- Set up health checks
- Monitor Blockfrost API usage

## 🔐 Security for Production

1. **Environment Variables:**
   - Never commit `.env` files (they're gitignored)
   - Store sensitive data in Render's environment variables
   - Rotate Blockfrost keys periodically

2. **CORS:**
   - Restrict CORS to your frontend domain only
   - Update `server/src/index.js` to use `CORS_ORIGIN` env var

3. **Rate Limiting:**
   - Add rate limiting to prevent abuse
   - Monitor API usage

4. **Database:**
   - Regular backups
   - Consider migrating to PostgreSQL for production

## 🌐 Custom Domain (Optional)

### For Frontend (Render)
1. Go to frontend service → Settings
2. Add custom domain
3. Update DNS records as instructed

### For Backend (Render)
1. Go to backend service → Settings
2. Add custom domain for API
3. Update frontend `VITE_API_BASE` to use custom domain

## 📊 Post-Deployment Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured correctly
- [ ] CORS configured properly
- [ ] Wallet connects successfully
- [ ] Balance displays correctly
- [ ] Lab activation works
- [ ] Rewards accumulate
- [ ] Claims process successfully
- [ ] Database persists data (check after redeployment)
- [ ] Blockfrost API calls working
- [ ] Treasury receiving payments

## 🆘 Troubleshooting

### Backend won't start
- Check Render logs
- Verify all environment variables set
- Check `PORT` is set to 8787

### Frontend can't reach backend
- Verify `VITE_API_BASE` URL is correct
- Check CORS settings
- Ensure backend is running

### Database resets
- Free tier doesn't have persistent disk
- Upgrade to paid tier or use external database

### Transactions fail verification
- Check Blockfrost API key is valid
- Verify network is set to `mainnet`
- Check treasury address is correct
- Ensure COKE policy ID is correct

## 💡 Alternative Deployment Options

### Vercel (Frontend)
- Better for frontend hosting
- Automatic deployments on push
- Free tier with good limits

### Railway (Backend)
- Similar to Render
- Good free tier
- PostgreSQL included

### AWS/GCP/Azure
- More complex setup
- Better for large scale
- Full control

---

## 🎉 You're Live!

Once deployed, share your dApp URL and let users activate their Coke Labs!

Remember:
- Monitor Blockfrost API usage
- Check database regularly
- Backup data frequently
- Test thoroughly before heavy marketing

