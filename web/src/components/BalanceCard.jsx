import React, { useState, useEffect } from 'react';
import { getWalletUtxos, calculateTokenBalance, calculateAdaBalance, getCokeUnit } from '../lib/lucid';

function BalanceCard({ lucid, address }) {
  const [adaBalance, setAdaBalance] = useState(0n);
  const [cokeBalance, setCokeBalance] = useState(0n);
  const [loading, setLoading] = useState(true);

  const COKE_UNIT = getCokeUnit();

  const loadBalances = async () => {
    try {
      setLoading(true);
      const utxos = await getWalletUtxos(lucid);
      
      const ada = calculateAdaBalance(utxos);
      const coke = calculateTokenBalance(utxos, COKE_UNIT);
      
      setAdaBalance(ada);
      setCokeBalance(coke);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lucid) {
      loadBalances();
      // Refresh balances every 30 seconds
      const interval = setInterval(loadBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [lucid]);

  const formatAda = (lovelace) => {
    return (Number(lovelace) / 1_000_000).toFixed(2);
  };

  const formatCoke = (amount) => {
    return Number(amount).toLocaleString();
  };

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 15)}...${addr.slice(-10)}`;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Your Wallet</h2>
        <button 
          onClick={loadBalances}
          className="text-sm text-gray-500 hover:text-farm-cyan transition-colors"
          disabled={loading}
        >
          {loading ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Address */}
      <div className="mb-6 p-3 bg-black rounded-lg border border-zinc-800">
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Address</p>
        <p className="font-mono text-sm break-all text-gray-400">{address}</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ADA Balance */}
        <div className="stat-box border-farm-cyan/20">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">ADA Balance</p>
          <p className="text-4xl font-bold text-farm-cyan">
            ₳ {formatAda(adaBalance)}
          </p>
        </div>

        {/* COKE Balance */}
        <div className="stat-box glow-pink border-farm-pink/30">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">COKE Balance</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-farm-pink to-farm-purple bg-clip-text text-transparent">
            {formatCoke(cokeBalance)}
          </p>
        </div>
      </div>

      {cokeBalance === 0n && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
          <p className="text-yellow-300 text-sm">
            ⚠️ You need COKE tokens to activate your lab
          </p>
        </div>
      )}
    </div>
  );
}

export default BalanceCard;

