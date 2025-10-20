import React, { useState, useEffect } from 'react';
import { sendPayment, getWalletUtxos, calculateAdaBalance } from '../lib/lucid';

const TREASURY_ADDRESS = 'addr1qxt3zjdf8txg9nm2kmheeaewljt03u2wp7k8dqnk3rdnlcupw928nm9v00v9p5epk5gt4umj26dqeqgpzksej9wsecwq9w2lvw';
const LAB_COST_ADA = 100;

function StartLab({ lucid, address, onLabActivated }) {
  const [adaBalance, setAdaBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;

  // Load wallet balance
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const utxos = await getWalletUtxos(lucid);
        const balance = calculateAdaBalance(utxos);
        setAdaBalance(Number(balance) / 1_000_000);
      } catch (err) {
        console.error('Error loading balance:', err);
      }
    };
    loadBalance();
  }, [lucid]);

  const handleStartLab = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if user has enough ADA
      if (adaBalance < LAB_COST_ADA + 2) {
        throw new Error(`Insufficient ADA. Need ${LAB_COST_ADA + 2} ADA (${LAB_COST_ADA} + 2 for fees)`);
      }

      // Send payment transaction
      const assets = {
        lovelace: BigInt(LAB_COST_ADA * 1_000_000)
      };

      console.log('Sending payment to treasury:', TREASURY_ADDRESS);
      const hash = await sendPayment(lucid, TREASURY_ADDRESS, assets);
      console.log('Transaction submitted:', hash);

      // Wait for transaction to be seen
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Activate lab on backend
      const response = await fetch(`${API_BASE}/api/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: address,
          txHash: hash
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate lab');
      }

      setSuccess(true);
      
      // Reload balance
      const utxos = await getWalletUtxos(lucid);
      const balance = calculateAdaBalance(utxos);
      setAdaBalance(Number(balance) / 1_000_000);

      // Wait a moment to show success, then activate
      setTimeout(() => {
        onLabActivated();
      }, 2000);

    } catch (err) {
      console.error('Start lab error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4">
      <div className="w-full max-w-sm">
        
        {/* Single Compact Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-6">
          
          {/* Balance */}
          <div className="text-center mb-6">
            <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Balance</div>
            <div className="text-4xl font-bold text-white">₳ {adaBalance.toFixed(2)}</div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800 my-4"></div>

          {/* Cost */}
          <div className="text-center mb-4">
            <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Cost</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              {LAB_COST_ADA} ADA
            </div>
          </div>

          {/* Error/Success */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded p-2 mb-3">
              <p className="text-red-300 text-xs text-center">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/20 border border-green-500/30 rounded p-2 mb-3">
              <p className="text-green-300 text-xs text-center">✅ Success!</p>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleStartLab}
            disabled={loading || success || adaBalance < LAB_COST_ADA + 2}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Processing...' : success ? 'Success!' : 'Start Lab'}
          </button>

        </div>

      </div>
    </div>
  );
}

export default StartLab;

