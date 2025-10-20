import React, { useState, useEffect } from 'react';
import { getWalletUtxos, calculateAdaBalance } from '../lib/lucid';

function BalanceCard({ lucid, address }) {
  const [adaBalance, setAdaBalance] = useState(0n);
  const [loading, setLoading] = useState(true);

  const loadBalances = async () => {
    try {
      setLoading(true);
      const utxos = await getWalletUtxos(lucid);
      const ada = calculateAdaBalance(utxos);
      setAdaBalance(ada);
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

      {/* ADA Balance - Full Width */}
      <div className="bg-black rounded p-4 border border-zinc-800">
        <p className="text-[10px] text-gray-600 mb-1 uppercase">ADA Balance</p>
        <p className="text-3xl font-bold text-farm-cyan">
          ₳ {formatAda(adaBalance)}
        </p>
      </div>
    </div>
  );
}

export default BalanceCard;

