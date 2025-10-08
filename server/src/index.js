import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { statements } from './db.js';
import { verifyCokePayment, getTransactionStatus } from './blockfrost.js';
import { accruePending, getFarmState, initializeFarm } from './game.js';
import { isAdmin, getAdminStats, getAllUsers, getAllPayments } from './admin.js';

// Validate configuration before starting
validateConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/config
 * Returns public configuration for the frontend
 */
app.get('/api/config', (req, res) => {
  res.json({
    network: config.blockfrost.network,
    treasuryAddress: config.treasury.address,
    cokePolicyId: config.token.policyId,
    cokeAssetName: config.token.assetName,
    cokeUnit: config.token.unit,
    startLabPrice: config.game.startLabPrice,
    basePower: config.game.basePower,
    emissionPerSecond: config.game.emissionPerSecond,
    halvingIntervalSeconds: config.game.halvingIntervalSeconds
  });
});

/**
 * POST /api/start
 * Activate a user's lab after verifying COKE payment (admin skips payment)
 */
app.post('/api/start', async (req, res) => {
  const { address, txHash } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }
  
  try {
    // Check if farm already exists
    const existingFarm = statements.getFarm.get(address);
    if (existingFarm) {
      return res.status(400).json({ error: 'Lab already activated for this address' });
    }
    
    const now = Math.floor(Date.now() / 1000);
    const isAdmin = address === config.treasury.address;
    
    // Admin can activate without payment
    if (isAdmin) {
      console.log(`🔐 Admin ${address} activating farm without payment`);
      
      // Create farm for admin
      const farm = initializeFarm(address, now);
      statements.createFarm.run(
        farm.address,
        farm.base_power,
        farm.last_claim_timestamp,
        farm.activated_at
      );
      
      console.log(`✓ Admin lab activated for ${address}`);
      
      return res.json({
        success: true,
        message: 'Admin lab activated successfully',
        farm: {
          address: farm.address,
          basePower: farm.base_power,
          activatedAt: farm.activated_at
        }
      });
    }
    
    // Non-admin users must provide txHash and verify payment
    if (!txHash) {
      return res.status(400).json({ error: 'Missing txHash' });
    }
    
    // Check if payment already processed
    const existingPayment = statements.getPayment.get(txHash);
    if (existingPayment && existingPayment.verified === 1) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }
    
    // Check transaction confirmation
    const txStatus = await getTransactionStatus(txHash);
    if (!txStatus.confirmed) {
      return res.status(400).json({ 
        error: 'Transaction not confirmed',
        details: txStatus.error 
      });
    }
    
    // Verify COKE payment on-chain
    const verification = await verifyCokePayment(txHash, config.game.startLabPrice);
    
    if (!verification.verified) {
      return res.status(400).json({ 
        error: 'Payment verification failed',
        details: verification.error 
      });
    }
    
    // Record payment
    if (!existingPayment) {
      statements.createPayment.run(address, txHash, verification.amount);
    }
    statements.verifyPayment.run(now, txHash);
    
    // Create farm
    const farm = initializeFarm(address, now);
    statements.createFarm.run(
      farm.address,
      farm.base_power,
      farm.last_claim_timestamp,
      farm.activated_at
    );
    
    console.log(`✓ Lab activated for ${address}`);
    
    res.json({
      success: true,
      message: 'Lab activated successfully',
      farm: {
        address: farm.address,
        basePower: farm.base_power,
        activatedAt: farm.activated_at
      }
    });
    
  } catch (error) {
    console.error('Start lab error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/state/:address
 * Get current state of a user's lab
 */
app.get('/api/state/:address', (req, res) => {
  const { address } = req.params;
  
  try {
    const farm = statements.getFarm.get(address);
    
    if (!farm) {
      return res.status(404).json({ error: 'Lab not found for this address' });
    }
    
    const totalPowerResult = statements.getTotalPower.get();
    const totalPower = totalPowerResult?.total || 0;
    const now = Math.floor(Date.now() / 1000);
    
    const state = getFarmState(farm, totalPower, now);
    
    res.json(state);
    
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * POST /api/claim
 * Claim pending rewards
 */
app.post('/api/claim', (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }
  
  try {
    const farm = statements.getFarm.get(address);
    
    if (!farm) {
      return res.status(404).json({ error: 'Lab not found for this address' });
    }
    
    const now = Math.floor(Date.now() / 1000);
    const pending = accruePending(farm, now);
    
    if (pending <= 0) {
      return res.status(400).json({ error: 'No pending rewards to claim' });
    }
    
    // Claim rewards
    statements.claimFarmRewards.run(pending, now, address);
    
    console.log(`✓ Claimed ${pending.toFixed(2)} rewards for ${address}`);
    
    res.json({
      success: true,
      claimed: pending,
      newTotal: farm.total_claimed + pending,
      timestamp: now
    });
    
  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * POST /api/booster/buy
 * Buy a booster pack to upgrade farm power
 */
app.post('/api/booster/buy', async (req, res) => {
  const { address, txHash } = req.body;
  
  if (!address || !txHash) {
    return res.status(400).json({ error: 'Missing address or txHash' });
  }
  
  try {
    // Check if farm exists
    const farm = statements.getFarm.get(address);
    if (!farm) {
      return res.status(404).json({ error: 'Lab not found. Activate your lab first.' });
    }
    
    // Check if booster pack already processed
    const existingPack = statements.getBoosterPack.get(txHash);
    if (existingPack && existingPack.verified === 1) {
      return res.status(400).json({ error: 'Booster pack already claimed' });
    }
    
    // Check transaction confirmation
    const txStatus = await getTransactionStatus(txHash);
    if (!txStatus.confirmed) {
      return res.status(400).json({ 
        error: 'Transaction not confirmed',
        details: txStatus.error 
      });
    }
    
    // Verify COKE payment (300 COKE for a booster pack)
    const BOOSTER_PACK_PRICE = 300;
    const verification = await verifyCokePayment(txHash, BOOSTER_PACK_PRICE);
    
    if (!verification.verified) {
      return res.status(400).json({ 
        error: 'Payment verification failed',
        details: verification.error 
      });
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    // Generate random power bonus (10-50 power)
    const powerBonus = Math.floor(Math.random() * 41) + 10; // 10-50
    
    // Determine pack rarity based on bonus
    let packType = 'Common';
    if (powerBonus >= 40) packType = 'Legendary';
    else if (powerBonus >= 30) packType = 'Epic';
    else if (powerBonus >= 20) packType = 'Rare';
    
    // Record booster pack
    if (!existingPack) {
      statements.createBoosterPack.run(address, txHash, packType, powerBonus);
    }
    statements.verifyBoosterPack.run(now, txHash);
    
    // Apply power bonus to farm
    statements.upgradeFarmPower.run(powerBonus, address);
    
    console.log(`✓ Booster pack opened for ${address}: ${packType} +${powerBonus} power`);
    
    res.json({
      success: true,
      packType,
      powerBonus,
      newPower: farm.base_power + powerBonus,
      message: `${packType} Pack! +${powerBonus} Grow Power!`
    });
    
  } catch (error) {
    console.error('Booster pack error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/leaderboard
 * Get top farms by total claimed
 */
app.get('/api/leaderboard', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const farms = statements.getAllFarms.all();
    
    const leaderboard = farms.slice(0, limit).map(farm => ({
      address: farm.address,
      basePower: farm.base_power,
      totalClaimed: farm.total_claimed,
      activatedAt: farm.activated_at
    }));
    
    res.json(leaderboard);
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/stats
 * Get global statistics
 */
app.get('/api/stats', (req, res) => {
  try {
    const totalPowerResult = statements.getTotalPower.get();
    const totalPower = totalPowerResult?.total || 0;
    const farms = statements.getAllFarms.all();
    const now = Math.floor(Date.now() / 1000);
    
    // Calculate total pending across all farms
    let totalPending = 0;
    let totalClaimed = 0;
    
    for (const farm of farms) {
      totalPending += accruePending(farm, now);
      totalClaimed += farm.total_claimed;
    }
    
    res.json({
      totalFarms: farms.length,
      totalPower: totalPower,
      totalClaimed: totalClaimed,
      totalPending: totalPending,
      currentEmission: config.game.emissionPerSecond
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/stats
 * Get admin dashboard stats (treasury wallet only)
 */
app.get('/api/admin/stats', (req, res) => {
  const { address } = req.query;
  
  if (!address || !isAdmin(address)) {
    return res.status(403).json({ error: 'Unauthorized: Admin access only' });
  }
  
  try {
    const stats = getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users with stats (treasury wallet only)
 */
app.get('/api/admin/users', (req, res) => {
  const { address } = req.query;
  
  if (!address || !isAdmin(address)) {
    return res.status(403).json({ error: 'Unauthorized: Admin access only' });
  }
  
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/payments
 * Get all payments (treasury wallet only)
 */
app.get('/api/admin/payments', (req, res) => {
  const { address } = req.query;
  
  if (!address || !isAdmin(address)) {
    return res.status(403).json({ error: 'Unauthorized: Admin access only' });
  }
  
  try {
    const payments = getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Admin payments error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`\n🚀 Coke Lab Server running on http://localhost:${PORT}`);
  console.log(`   Network: ${config.blockfrost.network}`);
  console.log(`   Treasury: ${config.treasury.address}`);
  console.log(`\n   Endpoints:`);
  console.log(`   - GET  /api/config`);
  console.log(`   - POST /api/start`);
  console.log(`   - GET  /api/state/:address`);
  console.log(`   - POST /api/claim`);
  console.log(`   - GET  /api/leaderboard`);
  console.log(`   - GET  /api/stats`);
  console.log(`   - GET  /health\n`);
});

