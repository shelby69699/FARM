import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';

function Lab({ address, onBack, isAdmin }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

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

  const farmingPerDay = (state.currentEmissionRate * state.networkShare / 100 * 86400).toFixed(2);

  return (
    <div className="min-h-screen">
      {/* Show Admin Dashboard if toggled */}
      {isAdmin && showAdmin ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <button
              onClick={() => setShowAdmin(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              ← Back to Farm
            </button>
          </div>
          <AdminDashboard address={address} />
        </div>
      ) : (
        <>
          {/* Grid Layout: Left Sidebar + Right 3D View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* LEFT SIDEBAR - Statistics */}
            <div className="lg:col-span-4 space-y-4">
          
          {/* Current Estimate Card */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Estimate</h3>
              <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-[10px] text-gray-500">?</span>
              </div>
            </div>
            <div className="text-5xl font-bold text-white mb-6">
              {state.pending.toFixed(2)}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Network Share</span>
                <span className="text-sm font-medium text-white">{state.networkShare.toFixed(6)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Farming COKE per day</span>
                <span className="text-sm font-medium text-white">{farmingPerDay}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 mb-4">
              ESTIMATE (CHANGES WITH OTHER PLAYERS' GROW POWER)
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded p-3 mb-3">
                <p className="text-red-300 text-xs">❌ {error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-500/50 rounded p-3 mb-3">
                <p className="text-green-300 text-xs">✅ {success}</p>
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={claiming || state.pending <= 0}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? 'Claiming...' : 'Claim COKE'}
            </button>
          </div>

          {/* Your Farm Card */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-farm-pink to-farm-purple"></div>
                <h3 className="text-lg font-bold text-white">Your Farm</h3>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button 
                    onClick={() => setShowAdmin(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                  >
                    🔐 Admin
                  </button>
                )}
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-gray-400 text-sm">←</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Farm Level</span>
                <span className="text-sm font-bold text-white">Level 1</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Grow Power</span>
                <span className="text-sm font-bold text-farm-cyan">{state.basePower.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Claimed COKE</span>
                <span className="text-sm font-bold text-green-400">{state.totalClaimed.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  Next halving
                  <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-[10px] text-gray-500">?</span>
                  </div>
                </span>
                <span className="text-sm font-bold text-orange-400">{formatTimeUntil(state.nextHalvingTimestamp)}</span>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">System Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Emission Rate</span>
                <span className="text-sm font-medium text-yellow-400">{state.currentEmissionRate.toFixed(4)} COKE/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Active Since</span>
                <span className="text-xs font-medium text-gray-400">{new Date(state.activatedAt * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE - 3D Model Area */}
        <div className="lg:col-span-8">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 h-[calc(100vh-8rem)] flex items-center justify-center overflow-hidden relative">
            {/* 3D Scene Container */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
              {/* Placeholder for 3D model */}
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative">
                  {/* Animated beaker/flask illustration */}
                  <div className="relative w-64 h-64 mb-8">
                    <img 
                      src="/eb89be31-3ac0-4d2d-bc0c-6e4bb2e1b082.svg" 
                      alt="Farm Lab 3D" 
                      className="w-full h-full animate-pulse"
                      style={{ filter: 'drop-shadow(0 0 40px rgba(255, 0, 255, 0.4))' }}
                    />
                  </div>
                  
                  {/* Floating stats around the model */}
                  <div className="absolute -top-4 -right-4 bg-zinc-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-farm-pink/30">
                    <div className="text-xs text-gray-400">Power</div>
                    <div className="text-lg font-bold text-farm-pink">{state.basePower}</div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-zinc-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-farm-cyan/30">
                    <div className="text-xs text-gray-400">Pending</div>
                    <div className="text-lg font-bold text-farm-cyan">{state.pending.toFixed(2)}</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">Your COKE Lab is Active</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">Generating rewards...</span>
                  </div>
                </div>

                <div className="mt-8 text-xs text-gray-700">
                  3D visualization coming soon
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      </>
      )}
    </div>
  );
}

export default Lab;

