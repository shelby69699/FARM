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
      <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-farm-pink to-farm-cyan bg-clip-text text-transparent">
        🧪 Activate Your Lab
      </h2>

      <div className="mb-8">
        <div className="bg-gradient-to-br from-farm-pink/10 via-farm-purple/10 to-farm-cyan/10 border border-farm-cyan/30 rounded-2xl p-6 mb-6 glow-cyan">
          <h3 className="text-xl font-bold mb-4 text-farm-cyan">What you get:</h3>
          <ul className="space-y-3 text-gray-300">
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

        <div className="stat-box mb-6 glow-pink">
          <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Activation Cost</p>
          <p className="text-5xl font-bold bg-gradient-to-r from-farm-pink to-farm-purple bg-clip-text text-transparent">
            {config.startLabPrice.toLocaleString()}
          </p>
          <p className="text-lg text-farm-cyan mt-1">COKE</p>
          <p className="text-sm text-gray-500 mt-3">
            + {(MIN_ADA / 1_000_000).toFixed(2)} ADA (transaction minimum)
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Treasury Address</p>
          <p className="font-mono text-xs break-all text-gray-300">
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
        className="btn-primary w-full text-xl"
      >
        {loading ? '⏳ Processing...' : verifying ? '⏳ Verifying...' : '🚀 Start Lab'}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Make sure you have enough COKE tokens and ADA for transaction fees
      </p>
    </div>
  );
}

export default StartLab;

