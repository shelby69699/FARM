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
    <div className="flex items-center justify-center py-20">
      <div className="text-center w-full max-w-md">
        
        {/* Heading */}
        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
          START YOUR LAB
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-500 text-base mb-12">
          {LAB_COST_ADA} $ADA IS REQUIRED
        </p>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-6">
            <p className="text-green-300 text-sm">✅ Lab activated successfully!</p>
          </div>
        )}

        {/* Proceed Button */}
        <button
          onClick={handleStartLab}
          disabled={loading || success || adaBalance < LAB_COST_ADA + 2}
          className="w-full max-w-xs mx-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
        >
          {loading ? 'Processing...' : success ? 'Success!' : 'Proceed'}
        </button>

      </div>
    </div>
  );
}

export default StartLab;

