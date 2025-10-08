import React, { useState } from 'react';
import { sendPayment, getCokeUnit, getWalletUtxos, calculateTokenBalance } from '../lib/lucid';

function BoosterPack({ lucid, address, onPurchased }) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE;
  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;
  const MIN_ADA = 2000000; // 2 ADA
  const BOOSTER_PACK_PRICE = 300; // 300 COKE
  const COKE_UNIT = getCokeUnit();

  const handleBuyPack = async () => {
    setLoading(true);
    setError(null);
    setTxHash(null);
    setResult(null);

    try {
      // Check if user has enough COKE
      const utxos = await getWalletUtxos(lucid);
      const cokeBalance = calculateTokenBalance(utxos, COKE_UNIT);
      
      if (cokeBalance < BigInt(BOOSTER_PACK_PRICE)) {
        throw new Error(`Insufficient COKE. Need ${BOOSTER_PACK_PRICE}, have ${cokeBalance.toString()}`);
      }

      // Build and send payment
      const assets = {
        lovelace: BigInt(MIN_ADA),
        [COKE_UNIT]: BigInt(BOOSTER_PACK_PRICE)
      };

      console.log('Buying booster pack...');
      const hash = await sendPayment(lucid, TREASURY_ADDRESS, assets);
      console.log('Transaction submitted:', hash);
      
      setTxHash(hash);
      setVerifying(true);

      // Wait for transaction to be seen
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Open booster pack on backend
      const response = await fetch(`${API_BASE}/api/booster/buy`, {
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
        throw new Error(errorData.details || errorData.error || 'Failed to open booster pack');
      }

      const packResult = await response.json();
      console.log('Booster pack opened:', packResult);

      // Success!
      setResult(packResult);
      setVerifying(false);
      
      // Notify parent to refresh
      if (onPurchased) {
        setTimeout(() => onPurchased(), 2000);
      }

    } catch (err) {
      console.error('Booster pack error:', err);
      setError(err.message);
      setVerifying(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📦</span>
            Booster Pack
          </h3>
          <div className="text-xs px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 font-medium">
            POWER UP
          </div>
        </div>

        {/* Pack Display */}
        <div className="mb-6">
          <div className="relative group cursor-pointer" onClick={!loading && !verifying ? handleBuyPack : null}>
            {/* Pack Image Container */}
            <div className="aspect-square max-w-[200px] mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform opacity-80 blur-sm"></div>
              <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-xl border-2 border-purple-500/50 p-6 flex flex-col items-center justify-center transform group-hover:scale-105 transition-all">
                <div className="text-6xl mb-2">🧪</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Booster</div>
                <div className="text-lg font-bold text-purple-400">PACK</div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-xl"></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{BOOSTER_PACK_PRICE} COKE</div>
              <div className="text-xs text-gray-600">+ 2 ADA transaction fee</div>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="bg-black/40 rounded-xl p-4 border border-zinc-800 mb-4">
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Random Upgrade:</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-green-400">⚡</span>
              <span>+10-19 Power (Common)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">⚡⚡</span>
              <span>+20-29 Power (Rare)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">⚡⚡⚡</span>
              <span>+30-39 Power (Epic)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">⚡⚡⚡⚡</span>
              <span>+40-50 Power (Legendary)</span>
            </li>
          </ul>
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-4 mb-4 animate-pulse">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-xl font-bold text-purple-400 mb-1">{result.packType} Pack!</div>
              <div className="text-3xl font-bold text-white mb-2">+{result.powerBonus} Power</div>
              <div className="text-sm text-gray-400">New Total: {result.newPower} Power</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-xs">❌ {error}</p>
          </div>
        )}

        {/* Transaction Status */}
        {txHash && !result && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-4">
            <p className="text-blue-300 text-xs mb-1">
              {verifying ? '🔄 Opening pack...' : '✅ Transaction submitted'}
            </p>
            <p className="font-mono text-[10px] break-all text-gray-400">{txHash}</p>
          </div>
        )}

        {/* Buy Button */}
        <button
          onClick={handleBuyPack}
          disabled={loading || verifying}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? '⏳ Processing...' : verifying ? '🔄 Opening Pack...' : '🎁 Buy Pack'}
        </button>

        <p className="text-[10px] text-gray-600 mt-3 text-center">
          Each pack contains a random power upgrade to boost your farming rewards
        </p>
      </div>
    </div>
  );
}

export default BoosterPack;

