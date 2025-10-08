import { config } from './config.js';

/**
 * Calculate the current emission rate based on halvings
 */
export function currentEmission(timestamp) {
  const { genesisTimestamp, halvingIntervalSeconds, emissionPerSecond } = config.game;
  
  const elapsed = timestamp - genesisTimestamp;
  if (elapsed < 0) return 0;
  
  const halvingsPassed = Math.floor(elapsed / halvingIntervalSeconds);
  const currentRate = emissionPerSecond / Math.pow(2, halvingsPassed);
  
  return currentRate;
}

/**
 * Get the timestamp of the next halving event
 */
export function nextHalvingTimestamp(timestamp) {
  const { genesisTimestamp, halvingIntervalSeconds } = config.game;
  
  const elapsed = timestamp - genesisTimestamp;
  const halvingsPassed = Math.floor(elapsed / halvingIntervalSeconds);
  
  return genesisTimestamp + (halvingsPassed + 1) * halvingIntervalSeconds;
}

/**
 * Accrue pending rewards for a farm from lastClaimTimestamp to now
 * This correctly handles halving boundaries
 */
export function accruePending(farm, nowTimestamp) {
  let accumulated = farm.pending || 0;
  let currentTime = farm.last_claim_timestamp;
  const endTime = nowTimestamp;
  
  const { genesisTimestamp, halvingIntervalSeconds, emissionPerSecond } = config.game;
  
  while (currentTime < endTime) {
    // Find the next halving boundary
    const elapsed = currentTime - genesisTimestamp;
    const halvingsPassed = Math.floor(elapsed / halvingIntervalSeconds);
    const nextHalving = genesisTimestamp + (halvingsPassed + 1) * halvingIntervalSeconds;
    
    // Accrue until the next halving or until endTime, whichever comes first
    const accrueUntil = Math.min(nextHalving, endTime);
    const duration = accrueUntil - currentTime;
    
    // Calculate emission rate for this period
    const rate = emissionPerSecond / Math.pow(2, halvingsPassed);
    
    // Add rewards for this period
    accumulated += farm.base_power * rate * duration;
    
    currentTime = accrueUntil;
  }
  
  return accumulated;
}

/**
 * Calculate network share for a farm
 */
export function calculateNetworkShare(farmPower, totalPower) {
  if (totalPower === 0) return 0;
  return (farmPower / totalPower) * 100;
}

/**
 * Get current game state for a farm
 */
export function getFarmState(farm, totalPower, nowTimestamp) {
  if (!farm) return null;
  
  const pending = accruePending(farm, nowTimestamp);
  const share = calculateNetworkShare(farm.base_power, totalPower);
  const emission = currentEmission(nowTimestamp);
  const nextHalving = nextHalvingTimestamp(nowTimestamp);
  
  return {
    address: farm.address,
    basePower: farm.base_power,
    totalClaimed: farm.total_claimed,
    pending: pending,
    networkShare: share,
    currentEmissionRate: emission,
    nextHalvingTimestamp: nextHalving,
    activatedAt: farm.activated_at,
    lastClaimTimestamp: farm.last_claim_timestamp
  };
}

/**
 * Initialize a new farm
 */
export function initializeFarm(address, nowTimestamp) {
  return {
    address,
    base_power: config.game.basePower,
    total_claimed: 0,
    pending: 0,
    last_claim_timestamp: nowTimestamp,
    activated_at: nowTimestamp
  };
}

