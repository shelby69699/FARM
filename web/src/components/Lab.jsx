import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import BoosterPack from './BoosterPack';

function Lab({ address, onBack, isAdmin, lucid }) {
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
        throw new Error('Failed to load farm state');
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
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, [address]);

  const handleClaim = async () => {
    if (state.pending <= 0) return;
    
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
      
      await loadState();
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatTimeUntil = (timestamp) => {
    const diff = timestamp - Math.floor(Date.now() / 1000);
    if (diff <= 0) return 'Soon';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-farm-pink mb-4"></div>
          <p className="text-gray-400">Loading your farm...</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load farm state</p>
          <button onClick={onBack} className="mt-4 text-farm-cyan hover:text-farm-pink transition-colors">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const farmingPerDay = (state.currentEmissionRate * state.networkShare / 100 * 86400).toFixed(2);

  return (
    <div className="min-h-screen pb-8">
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
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">Your Laboratory</h1>
                <p className="text-sm text-gray-500">Level 1 Production Facility</p>
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setShowAdmin(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all shadow-lg text-sm font-medium"
              >
                🔐 Admin Panel
              </button>
            )}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN - Main Stats */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Pending Rewards - Hero Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 border border-zinc-800/50">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Rewards</span>
                      </div>
                      <div className="text-6xl font-bold bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan bg-clip-text text-transparent mb-2">
                        {state.pending.toFixed(2)}
                      </div>
                      <div className="text-lg text-gray-500 font-medium">COKE</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Daily Rate</div>
                      <div className="text-2xl font-bold text-farm-cyan">{farmingPerDay}</div>
                      <div className="text-xs text-gray-600">COKE/day</div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-red-300 text-sm">❌ {error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                      <p className="text-green-300 text-sm">✅ {success}</p>
                    </div>
                  )}

                  <button
                    onClick={handleClaim}
                    disabled={claiming || state.pending <= 0}
                    className="w-full bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan hover:shadow-lg hover:shadow-farm-pink/50 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                  >
                    {claiming ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Claiming...
                      </span>
                    ) : state.pending <= 0 ? (
                      '💤 No Rewards Yet'
                    ) : (
                      `🎁 Claim ${state.pending.toFixed(2)} COKE`
                    )}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Network Share */}
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-zinc-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-farm-cyan/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-farm-cyan" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Network Share</div>
                      <div className="text-2xl font-bold text-white">{state.networkShare.toFixed(4)}%</div>
                    </div>
                  </div>
                </div>

                {/* Grow Power */}
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-zinc-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-farm-pink/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-farm-pink" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Grow Power</div>
                      <div className="text-2xl font-bold text-white">{state.basePower.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Total Harvested */}
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-zinc-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Total Harvested</div>
                      <div className="text-2xl font-bold text-white">{state.totalClaimed.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Emission Rate */}
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-zinc-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Emission Rate</div>
                      <div className="text-2xl font-bold text-white">{state.currentEmissionRate.toFixed(4)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-zinc-800/50">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-sm text-gray-400">Lab Activated</span>
                    <span className="text-sm font-medium text-white">{formatDate(state.activatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-400">Next Halving</span>
                    <span className="text-sm font-medium text-orange-400">{formatTimeUntil(state.nextHalvingTimestamp)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - Visual + Booster */}
            <div className="space-y-6">
              
              {/* Farm Visualization */}
              <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl border border-zinc-800/50 p-8 aspect-square flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-farm-purple/5 via-transparent to-transparent"></div>
                
                {/* Animated Circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full border-2"
                      style={{
                        width: `${(i + 1) * 100}px`,
                        height: `${(i + 1) * 100}px`,
                        borderColor: i % 2 === 0 ? 'rgba(255, 0, 255, 0.1)' : 'rgba(0, 255, 255, 0.1)',
                        animation: `spin ${30 - i * 5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`
                      }}
                    >
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-farm-pink rounded-full -translate-x-1/2"></div>
                    </div>
                  ))}
                </div>

                {/* Center Icon */}
                <div className="relative z-10">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-farm-pink via-farm-purple to-farm-cyan p-1 animate-pulse">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <div className="text-6xl">🧪</div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="text-sm text-gray-400">Status</div>
                    <div className="text-lg font-bold text-green-400">ACTIVE</div>
                  </div>
                </div>

                {/* Floating Particles */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`float-${i}`}
                    className="absolute w-1 h-1 bg-farm-cyan rounded-full"
                    style={{
                      left: `${20 + (i * 15) % 60}%`,
                      top: `${30 + (i * 20) % 40}%`,
                      animation: `float ${3 + i}s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                      opacity: 0.6
                    }}
                  />
                ))}
              </div>

              {/* Booster Pack */}
              {lucid && (
                <BoosterPack 
                  lucid={lucid} 
                  address={address}
                  onPurchased={() => {
                    loadState();
                  }}
                />
              )}

            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default Lab;
