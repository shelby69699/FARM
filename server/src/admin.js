import { config } from './config.js';
import { statements } from './db.js';
import { accruePending } from './game.js';

/**
 * Check if address is admin (treasury wallet)
 */
export function isAdmin(address) {
  return address === config.treasury.address;
}

/**
 * Get admin dashboard stats
 */
export function getAdminStats() {
  const farms = statements.getAllFarms.all();
  const totalPowerResult = statements.getTotalPower.get();
  const totalPower = totalPowerResult?.total || 0;
  const now = Math.floor(Date.now() / 1000);

  // Calculate totals
  let totalClaimed = 0;
  let totalPending = 0;
  let totalActivationFees = 0;

  for (const farm of farms) {
    totalClaimed += farm.total_claimed;
    totalPending += accruePending(farm, now);
  }

  // Get all payments
  const allPayments = statements.getAllPayments?.all() || [];
  for (const payment of allPayments) {
    if (payment.verified === 1) {
      totalActivationFees += payment.amount;
    }
  }

  return {
    totalUsers: farms.length,
    totalPower,
    totalClaimed,
    totalPending,
    totalActivationFees,
    activationPricePerUser: config.game.startLabPrice,
    currentEmissionRate: config.game.emissionPerSecond,
    halvingInterval: config.game.halvingIntervalSeconds,
  };
}

/**
 * Get all users with their current stats
 */
export function getAllUsers() {
  const farms = statements.getAllFarms.all();
  const totalPowerResult = statements.getTotalPower.get();
  const totalPower = totalPowerResult?.total || 0;
  const now = Math.floor(Date.now() / 1000);

  return farms.map(farm => {
    const pending = accruePending(farm, now);
    const share = totalPower > 0 ? (farm.base_power / totalPower) * 100 : 0;

    return {
      address: farm.address,
      basePower: farm.base_power,
      totalClaimed: farm.total_claimed,
      pending: pending,
      networkShare: share,
      activatedAt: farm.activated_at,
      lastClaimTimestamp: farm.last_claim_timestamp,
    };
  });
}

/**
 * Get all payments
 */
export function getAllPayments() {
  return statements.getAllPayments?.all() || [];
}

