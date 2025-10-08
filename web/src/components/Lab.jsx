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
          <p className="text-gray-400">Loading your lab...</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load lab state</p>
          <button onClick={onBack} className="mt-4 text-farm-cyan hover:text-farm-pink transition-colors">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const farmingPerDay = (state.currentEmissionRate * state.networkShare / 100 * 86400).toFixed(2);

  return (
    <div className="min-h-screen pb-8 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      {/* Show Admin Dashboard if toggled */}
      {isAdmin && showAdmin ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <button
              onClick={() => setShowAdmin(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              ← Back to Lab
            </button>
          </div>
          <AdminDashboard address={address} />
        </div>
      ) : (
        <>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 px-4 pt-4">
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

          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-6 px-4">
            
            {/* LEFT SIDEBAR - Stats */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              
              {/* Current Estimate Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-6 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Estimate</div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-5xl font-bold text-white mb-6">{state.pending.toFixed(2)}</div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Network Share</span>
                    <span className="text-farm-cyan font-medium">{state.networkShare.toFixed(4)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Farming per day</span>
                    <span className="text-white font-medium">{farmingPerDay}</span>
                  </div>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={claiming || state.pending <= 0}
                  className="w-full mt-6 bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claiming ? 'Claiming...' : state.pending <= 0 ? 'No Rewards' : 'Claim COKE'}
                </button>

                {error && (
                  <div className="mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-2">
                    <p className="text-red-300 text-xs">❌ {error}</p>
                  </div>
                )}

                {success && (
                  <div className="mt-3 bg-green-900/20 border border-green-500/30 rounded-lg p-2">
                    <p className="text-green-300 text-xs">✅ {success}</p>
                  </div>
                )}
              </div>

              {/* Farm Info Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl p-5 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-farm-pink to-farm-purple"></div>
                  <div>
                    <div className="text-sm font-bold text-white">COKE Lab</div>
                  </div>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Farm Level</span>
                    <span className="text-white font-medium">Level 1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Grow Power</span>
                    <span className="text-white font-medium">{state.basePower.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Claimed</span>
                    <span className="text-white font-medium">{state.totalClaimed.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Next halving</span>
                    <span className="text-orange-400 font-medium">{formatTimeUntil(state.nextHalvingTimestamp)}</span>
                  </div>
                </div>
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

            {/* CENTER - 3D Isometric Lab View */}
            <div className="col-span-12 lg:col-span-9">
              <div className="relative bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 rounded-2xl overflow-hidden border border-purple-500/20" style={{ height: '600px' }}>
                
                {/* 3D Scene Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative" style={{ 
                    transform: 'rotateX(60deg) rotateZ(45deg)',
                    transformStyle: 'preserve-3d',
                    width: '400px',
                    height: '400px'
                  }}>
                    
                    {/* Floor */}
                    <div className="absolute" style={{
                      width: '400px',
                      height: '400px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                      border: '2px solid rgba(168, 85, 247, 0.3)',
                      transform: 'translateZ(-50px)',
                      boxShadow: '0 0 60px rgba(168, 85, 247, 0.4)'
                    }}></div>

                    {/* Production Tank */}
                    <div className="absolute" style={{
                      width: '100px',
                      height: '150px',
                      left: '150px',
                      top: '150px',
                      background: 'linear-gradient(180deg, rgba(255, 0, 128, 0.3) 0%, rgba(255, 0, 128, 0.6) 100%)',
                      border: '2px solid rgba(255, 0, 128, 0.8)',
                      borderRadius: '10px',
                      transform: 'translateZ(75px)',
                      boxShadow: '0 0 40px rgba(255, 0, 128, 0.6)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}>
                      {/* Liquid Level Indicator */}
                      <div className="absolute bottom-0 left-0 right-0 bg-farm-pink" style={{
                        height: `${Math.min((state.pending / 100) * 100, 100)}%`,
                        opacity: 0.8,
                        boxShadow: '0 0 20px rgba(255, 0, 128, 0.8)'
                      }}></div>
                    </div>

                    {/* Power Generator */}
                    <div className="absolute" style={{
                      width: '80px',
                      height: '80px',
                      left: '50px',
                      top: '100px',
                      background: 'linear-gradient(180deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 255, 255, 0.6) 100%)',
                      border: '2px solid rgba(0, 255, 255, 0.8)',
                      borderRadius: '50%',
                      transform: 'translateZ(40px)',
                      boxShadow: '0 0 40px rgba(0, 255, 255, 0.8)',
                      animation: 'spin 3s linear infinite'
                    }}></div>

                    {/* Control Panel */}
                    <div className="absolute" style={{
                      width: '120px',
                      height: '100px',
                      left: '250px',
                      top: '80px',
                      background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',
                      border: '2px solid rgba(168, 85, 247, 0.6)',
                      borderRadius: '5px',
                      transform: 'translateZ(50px)',
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
                    }}></div>

                    {/* Storage Boxes */}
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="absolute" style={{
                        width: '60px',
                        height: '60px',
                        left: `${80 + i * 70}px`,
                        top: '280px',
                        background: 'linear-gradient(180deg, rgba(50, 50, 50, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%)',
                        border: '2px solid rgba(100, 100, 100, 0.6)',
                        borderRadius: '3px',
                        transform: 'translateZ(30px)',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
                      }}></div>
                    ))}
                  </div>
                </div>

                {/* Info Overlays */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-farm-cyan/30 rounded-lg px-4 py-2">
                  <div className="text-xs text-gray-400">Production Rate</div>
                  <div className="text-2xl font-bold text-farm-pink">{(state.currentEmissionRate * state.networkShare / 100 * 3600).toFixed(1)}</div>
                  <div className="text-xs text-gray-500">COKE/hour</div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-green-500/30 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-xs text-green-400 font-bold">PRODUCTION ACTIVE</div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/80 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-500">Power</div>
                        <div className="text-lg font-bold text-farm-pink">{state.basePower}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Efficiency</div>
                        <div className="text-lg font-bold text-farm-cyan">{state.networkShare.toFixed(4)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Pending</div>
                        <div className="text-lg font-bold text-yellow-400">{state.pending.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4">
                  <button className="px-6 py-2 bg-white hover:bg-gray-100 text-black font-bold rounded-lg transition-all">
                    Customize
                  </button>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: translateZ(40px) rotate(0deg); }
          to { transform: translateZ(40px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Lab;
