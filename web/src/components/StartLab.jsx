import React, { useState, useEffect } from 'react';
import { sendPayment, getCokeUnit, getWalletUtxos, calculateTokenBalance } from '../lib/lucid';

function StartLab({ lucid, address, onLabActivated }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;
  const MIN_ADA = parseInt(import.meta.env.VITE_MIN_ADA_FOR_TREASURY || '2000000');
  const COKE_UNIT = getCokeUnit();

  // Load config from backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/config`);
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error loading config:', err);
        setError('Failed to load configuration');
      }
    };
    loadConfig();
  }, []);

  const handleStartLab = async () => {
    if (!config) {
      setError('Configuration not loaded');
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Check if user has enough COKE
      const utxos = await getWalletUtxos(lucid);
      const cokeBalance = calculateTokenBalance(utxos, COKE_UNIT);
      
      if (cokeBalance < BigInt(config.startLabPrice)) {
        throw new Error(`Insufficient COKE balance. Need ${config.startLabPrice.toLocaleString()}, have ${cokeBalance.toString()}`);
      }

      // Build and send payment transaction
      const assets = {
        lovelace: BigInt(MIN_ADA),
        [COKE_UNIT]: BigInt(config.startLabPrice)
      };

      console.log('Sending payment to treasury:', config.treasuryAddress);
      console.log('Assets:', assets);

      const hash = await sendPayment(lucid, config.treasuryAddress, assets);
      console.log('Transaction submitted:', hash);
      
      setTxHash(hash);
      setVerifying(true);

      // Wait a bit for transaction to be seen by Blockfrost
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Verify and activate lab on backend
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
        throw new Error(errorData.details || errorData.error || 'Failed to activate lab');
      }

      const result = await response.json();
      console.log('Lab activated:', result);

      // Success!
      setVerifying(false);
      onLabActivated();

    } catch (err) {
      console.error('Start lab error:', err);
      setError(err.message);
      setVerifying(false);
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-medium mb-6 text-center text-gray-400">
        🧪 Activate Your Lab
      </h2>

      <div className="mb-6">
        <div className="bg-gradient-to-br from-farm-pink/5 via-farm-purple/5 to-farm-cyan/5 border border-farm-cyan/20 rounded p-4 mb-4">
          <h3 className="text-sm font-medium mb-3 text-farm-cyan uppercase tracking-wide">What you get:</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-farm-cyan">▸</span>
              <strong className="text-white">{config.basePower}</strong> Grow Power to start
            </li>
            <li className="flex items-center gap-2">
              <span className="text-farm-cyan">▸</span>
              Earn COKE rewards continuously
            </li>
            <li className="flex items-center gap-2">
              <span className="text-farm-cyan">▸</span>
              Share of global emissions based on your power
            </li>
            <li className="flex items-center gap-2">
              <span className="text-farm-cyan">▸</span>
              Claim rewards anytime
            </li>
          </ul>
        </div>

        <div className="bg-black rounded p-4 mb-4 border border-zinc-800">
          <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wide">Activation Cost</p>
          <p className="text-4xl font-bold text-farm-pink mb-1">
            {config.startLabPrice.toLocaleString()}
          </p>
          <p className="text-sm text-farm-cyan">COKE</p>
          <p className="text-xs text-gray-600 mt-2">
            + {(MIN_ADA / 1_000_000).toFixed(2)} ADA (transaction minimum)
          </p>
        </div>

        <div className="bg-black rounded p-3 mb-4 border border-zinc-800">
          <p className="text-[10px] text-gray-600 mb-1 uppercase">Treasury Address</p>
          <p className="font-mono text-[11px] break-all text-gray-500">
            {config.treasuryAddress}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}

      {txHash && (
        <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-6">
          <p className="text-blue-200 mb-2">
            {verifying ? '⏳ Verifying transaction...' : '✅ Transaction submitted'}
          </p>
          <p className="font-mono text-xs break-all text-gray-300">
            {txHash}
          </p>
        </div>
      )}

      <button
        onClick={handleStartLab}
        disabled={loading || verifying}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : verifying ? 'Verifying...' : '🚀 Start Lab'}
      </button>

      <p className="text-center text-xs text-gray-600 mt-3">
        Make sure you have enough COKE tokens and ADA for transaction fees
      </p>
    </div>
  );
}

export default StartLab;

