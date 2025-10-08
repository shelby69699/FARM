import React, { useState, useEffect } from 'react';

function Lab({ address }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE;

  const loadState = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/state/${address}`);
      if (!response.ok) {
        throw new Error('Failed to load lab state');
      }
      const data = await response.json();
      setState(data);
    } catch (err) {
      console.error('Error loading state:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
    // Refresh state every 10 seconds
    const interval = setInterval(loadState, 10000);
    return () => clearInterval(interval);
  }, [address]);

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/api/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim rewards');
      }

      const result = await response.json();
      setSuccess(`Successfully claimed ${result.claimed.toFixed(2)} COKE!`);
      
      // Reload state
      await loadState();

    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatTimeUntil = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    
    if (diff < 0) return 'Now';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 animate-pulse">Loading lab...</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400">Failed to load lab data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="card">
        <h2 className="text-3xl font-bold mb-4 text-center">
          🧪 Your Coke Lab is Active
        </h2>
        <p className="text-center text-gray-400">
          Activated on {formatDate(state.activatedAt)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Grow Power */}
        <div className="stat-box">
          <p className="text-sm text-gray-400 mb-2">💪 Grow Power</p>
          <p className="text-4xl font-bold text-green-400">
            {state.basePower}
          </p>
        </div>

        {/* Pending Rewards */}
        <div className="stat-box glow-red">
          <p className="text-sm text-gray-400 mb-2">⏳ Pending Rewards</p>
          <p className="text-4xl font-bold text-coke-red">
            {state.pending.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">COKE</p>
        </div>

        {/* Total Claimed */}
        <div className="stat-box">
          <p className="text-sm text-gray-400 mb-2">✅ Total Claimed</p>
          <p className="text-4xl font-bold text-blue-400">
            {state.totalClaimed.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">COKE</p>
        </div>

        {/* Network Share */}
        <div className="stat-box">
          <p className="text-sm text-gray-400 mb-2">🌐 Network Share</p>
          <p className="text-4xl font-bold text-purple-400">
            {state.networkShare.toFixed(4)}%
          </p>
        </div>

        {/* Current Emission Rate */}
        <div className="stat-box">
          <p className="text-sm text-gray-400 mb-2">📊 Emission Rate</p>
          <p className="text-4xl font-bold text-yellow-400">
            {state.currentEmissionRate.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">COKE/sec</p>
        </div>

        {/* Next Halving */}
        <div className="stat-box">
          <p className="text-sm text-gray-400 mb-2">⏰ Next Halving</p>
          <p className="text-2xl font-bold text-orange-400">
            {formatTimeUntil(state.nextHalvingTimestamp)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(state.nextHalvingTimestamp)}
          </p>
        </div>
      </div>

      {/* Claim Section */}
      <div className="card">
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-200">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-4">
            <p className="text-green-200">✅ {success}</p>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={claiming || state.pending <= 0}
          className="btn-primary w-full text-xl"
        >
          {claiming ? '⏳ Claiming...' : `🎁 Claim ${state.pending.toFixed(2)} COKE`}
        </button>

        {state.pending <= 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            No pending rewards to claim yet. Keep growing!
          </p>
        )}
      </div>

      {/* Info Section */}
      <div className="card bg-gradient-to-r from-gray-800 to-gray-900">
        <h3 className="text-xl font-bold mb-4">📈 How it works</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• Your lab generates COKE continuously based on your Grow Power</li>
          <li>• Rewards are calculated from the global emission rate</li>
          <li>• Your share is proportional to your power vs. total network power</li>
          <li>• Emissions halve every {(state.nextHalvingTimestamp - state.activatedAt) / 86400} days</li>
          <li>• Claim your rewards anytime - they accumulate automatically!</li>
        </ul>
      </div>
    </div>
  );
}

export default Lab;

