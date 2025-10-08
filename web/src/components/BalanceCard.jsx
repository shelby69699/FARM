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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white uppercase tracking-wide">Your Wallet</h3>
        <button 
          onClick={loadBalances}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          disabled={loading}
        >
          {loading ? '↻ Refresh' : '↻ Refresh'}
        </button>
      </div>

      {/* Address */}
      <div className="mb-4 p-2 bg-black rounded border border-zinc-800">
        <p className="text-[10px] text-gray-600 mb-1 uppercase">Address</p>
        <p className="font-mono text-xs text-gray-400 break-all">{address}</p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        {/* ADA Balance */}
        <div className="bg-black rounded p-3 border border-zinc-800">
          <p className="text-[10px] text-gray-600 mb-1 uppercase">ADA Balance</p>
          <p className="text-2xl font-bold text-farm-cyan">
            ₳ {formatAda(adaBalance)}
          </p>
        </div>

        {/* COKE Balance */}
        <div className="bg-black rounded p-3 border border-zinc-800">
          <p className="text-[10px] text-gray-600 mb-1 uppercase">COKE Balance</p>
          <p className="text-2xl font-bold text-farm-pink">
            {formatCoke(cokeBalance)}
          </p>
        </div>
      </div>

      {cokeBalance === 0n && (
        <div className="mt-3 p-2 bg-yellow-900/10 border border-yellow-600/30 rounded">
          <p className="text-yellow-400 text-xs">
            ⚠ You need COKE tokens to activate your lab
          </p>
        </div>
      )}
    </div>
  );
}

export default BalanceCard;

