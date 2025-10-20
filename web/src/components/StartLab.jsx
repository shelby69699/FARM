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
      <div className="w-full max-w-md">
        
        {/* ADA Balance Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-3">Your Balance</div>
            <div className="text-6xl font-bold text-white mb-2">
              ₳ {adaBalance.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 font-mono">{address.slice(0, 20)}...{address.slice(-20)}</div>
          </div>
        </div>

        {/* Activation Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Start Your Lab</h1>
            <p className="text-gray-500">Activate your laboratory and start earning</p>
          </div>

          {/* Cost Display */}
          <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-6 text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Activation Cost</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
              {LAB_COST_ADA}
            </div>
            <div className="text-xl text-gray-400">ADA</div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300 text-sm text-center">✅ Lab activated successfully!</p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartLab}
            disabled={loading || success || adaBalance < LAB_COST_ADA + 2}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
          >
            {loading ? 'Processing...' : success ? 'Activating...' : 'Start Lab'}
          </button>

          <p className="text-center text-xs text-gray-600 mt-4">
            Payment will be sent to treasury address
          </p>
        </div>

      </div>
    </div>
  );
}

export default StartLab;

