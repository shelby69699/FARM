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
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-farm-pink/5 to-farm-cyan/5 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Rewards</h3>
                <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-400 font-medium">
                  LIVE
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-5xl font-bold bg-gradient-to-r from-farm-pink to-farm-cyan bg-clip-text text-transparent mb-2">
                  {state.pending.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">COKE</div>
              </div>
              
              <div className="space-y-3 mb-6 bg-black/40 rounded-xl p-4 border border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Network Share</span>
                  <span className="text-sm font-bold text-farm-cyan">{state.networkShare.toFixed(6)}%</span>
                </div>
                <div className="h-px bg-zinc-800"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Daily Farming</span>
                  <span className="text-sm font-bold text-farm-pink">{farmingPerDay} COKE</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-3">
                  <p className="text-red-300 text-xs">❌ {error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 mb-3 animate-pulse">
                  <p className="text-green-300 text-xs">✅ {success}</p>
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={claiming || state.pending <= 0}
                className="w-full bg-gradient-to-r from-farm-pink to-farm-purple hover:from-farm-pink/90 hover:to-farm-purple/90 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-farm-pink/50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {claiming ? '⏳ Claiming...' : state.pending <= 0 ? '💤 No Rewards Yet' : `🎁 Claim ${state.pending.toFixed(2)} COKE`}
              </button>
              
              <p className="text-[10px] text-gray-600 mt-3 text-center">
                Rewards update in real-time based on network activity
              </p>
            </div>
          </div>

          {/* Your Farm Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan p-0.5 animate-pulse">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="text-xl">🧪</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Your Farm</h3>
                  <p className="text-[10px] text-gray-600">Level 1 Laboratory</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button 
                    onClick={() => setShowAdmin(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
                  >
                    🔐 Admin
                  </button>
                )}
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-600 transition-all"
                  >
                    <span className="text-gray-400 text-sm">←</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 bg-black/40 rounded-xl p-4 border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total Grow Power</span>
                <span className="text-sm font-bold text-farm-cyan">{state.basePower.toLocaleString()}</span>
              </div>
              
              <div className="h-px bg-zinc-800"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total Harvested</span>
                <span className="text-sm font-bold text-green-400">{state.totalClaimed.toFixed(2)} COKE</span>
              </div>

              <div className="h-px bg-zinc-800"></div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Next Halving</span>
                <span className="text-sm font-bold text-orange-400">{formatTimeUntil(state.nextHalvingTimestamp)}</span>
              </div>
            </div>
          </div>

          {/* System Stats */}
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 border border-zinc-800 shadow-xl">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              Network Stats
            </h3>
            <div className="space-y-3 bg-black/40 rounded-xl p-4 border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Global Emission</span>
                <span className="text-sm font-medium text-yellow-400">{state.currentEmissionRate.toFixed(4)} COKE/s</span>
              </div>
              <div className="h-px bg-zinc-800"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Lab Started</span>
                <span className="text-xs font-medium text-gray-400">{new Date(state.activatedAt * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Booster Pack */}
          {lucid && (
            <BoosterPack 
              lucid={lucid} 
              address={address}
              onPurchased={() => {
                // Reload state after purchase
                loadState();
              }}
            />
          )}

        </div>

        {/* RIGHT SIDE - Farm Visualization */}
        <div className="lg:col-span-8">
          <div className="bg-black rounded-2xl border border-zinc-800 h-[calc(100vh-8rem)] overflow-hidden relative">
            {/* Professional Beaker Laboratory */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              
              {/* Background Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-radial from-farm-pink/10 via-transparent to-transparent"
                   style={{ animation: 'production-pulse 4s ease-in-out infinite' }}></div>
              
              <div className="relative">
                {/* CSS Beaker */}
                <div className="relative w-64 h-80">
                  
                  {/* Energy Rings - Expanding from Reaction */}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`ring-${i}`}
                      className="absolute left-1/2 bottom-16 transform -translate-x-1/2 w-32 h-4 border-2 rounded-full"
                      style={{
                        borderColor: i % 2 === 0 ? 'rgba(255, 0, 255, 0.3)' : 'rgba(0, 255, 255, 0.3)',
                        animation: `energy-ring ${2 + i * 0.3}s ease-out infinite`,
                        animationDelay: `${i * 0.7}s`
                      }}
                    />
                  ))}
                  
                  {/* Realistic Steam/Vapor Rising from Top */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`steam-${i}`}
                      className="absolute w-10 h-10 rounded-full blur-lg"
                      style={{
                        left: `${25 + i * 12}%`,
                        top: '-30px',
                        background: `linear-gradient(to top, ${i % 2 === 0 ? 'rgba(255, 0, 255, 0.3)' : 'rgba(0, 255, 255, 0.3)'}, transparent)`,
                        animation: `steam-rise ${2.5 + i * 0.4}s ease-out infinite`,
                        animationDelay: `${i * 0.5}s`,
                        '--steam-drift': `${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}px`
                      }}
                    />
                  ))}
                  
                  {/* Beaker Container */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-64">
                    
                    {/* Heat Distortion Layer */}
                    <div className="absolute inset-0 rounded-b-3xl overflow-hidden pointer-events-none"
                         style={{ animation: 'heat-wave 3s ease-in-out infinite' }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent"></div>
                    </div>
                    
                    {/* Glass Beaker with Enhanced Glow */}
                    <div className="relative w-full h-full border-4 border-gray-300/50 rounded-b-3xl bg-gradient-to-b from-white/5 to-zinc-900/30 backdrop-blur-sm"
                         style={{ 
                           clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                           animation: 'glow-pulse 3s ease-in-out infinite',
                           boxShadow: '0 0 60px rgba(255, 0, 255, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.1)'
                         }}>
                      
                      {/* Reaction Glow at Bottom */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-24 rounded-full blur-2xl"
                           style={{
                             background: 'radial-gradient(circle, rgba(255, 0, 255, 0.8), rgba(0, 255, 255, 0.6), transparent)',
                             animation: 'reaction-glow 2s ease-in-out infinite'
                           }}></div>
                      
                      {/* Liquid Inside - Multi-layer Animated */}
                      <div className="absolute bottom-0 left-0 right-0 rounded-b-3xl transition-all duration-1000 overflow-hidden"
                           style={{ 
                             height: `${Math.min((state.pending / 100) * 60 + 25, 85)}%`,
                             animation: 'liquid-bubble 2.5s ease-in-out infinite'
                           }}>
                        
                        {/* Liquid Base Layer */}
                        <div className="absolute inset-0 bg-gradient-to-t from-farm-pink via-farm-purple to-farm-cyan/50"
                             style={{ 
                               opacity: 0.8,
                               boxShadow: '0 0 60px rgba(255, 0, 255, 0.8), inset 0 0 40px rgba(0, 255, 255, 0.4)'
                             }}></div>
                        
                        {/* Swirling Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-farm-cyan/30 to-transparent"
                             style={{ animation: 'shimmer 4s linear infinite' }}></div>
                        
                        {/* Professional Bubbles - Multiple Sizes */}
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={`bubble-${i}`}
                            className="absolute rounded-full"
                            style={{
                              width: `${3 + (i % 5) * 2}px`,
                              height: `${3 + (i % 5) * 2}px`,
                              left: `${5 + (i * 4.5) % 90}%`,
                              bottom: '0',
                              background: i % 3 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 255, 255, 0.6)',
                              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                              animation: `bubble-rise ${2.5 + (i % 5)}s ease-in infinite`,
                              animationDelay: `${i * 0.25}s`,
                              filter: 'blur(0.5px)'
                            }}
                          />
                        ))}

                        {/* COKE Production Particles - Enhanced */}
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={`particle-${i}`}
                            className="absolute text-[11px] font-black drop-shadow-lg"
                            style={{
                              left: `${10 + (i * 7.5) % 80}%`,
                              bottom: '5%',
                              animation: `particle-float ${3.5 + (i % 4)}s ease-out infinite`,
                              animationDelay: `${i * 0.5}s`,
                              '--float-x': `${(i % 2 === 0 ? 1 : -1) * (15 + i * 4)}px`,
                              color: i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffffff',
                              textShadow: `0 0 10px ${i % 2 === 0 ? '#ff00ff' : '#00ffff'}`
                            }}
                          >
                            +{state.currentEmissionRate.toFixed(1)}
                          </div>
                        ))}

                        {/* Sparkles in Liquid */}
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={`sparkle-${i}`}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                              left: `${20 + (i * 10) % 60}%`,
                              top: `${20 + (i * 15) % 60}%`,
                              animation: `sparkle ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                              animationDelay: `${i * 0.3}s`,
                              boxShadow: '0 0 6px rgba(255, 255, 255, 0.9)'
                            }}
                          />
                        ))}
                      </div>

                      {/* Professional Measurement Lines with Labels */}
                      {[
                        { height: 20, label: '250ml' },
                        { height: 40, label: '500ml' },
                        { height: 60, label: '750ml' },
                        { height: 80, label: '1L' }
                      ].map((mark, i) => (
                        <div key={i} 
                             className="absolute left-0 right-0 border-t border-cyan-400/40"
                             style={{ bottom: `${mark.height}%` }}>
                          <div className="absolute -left-14 -top-2 text-[9px] text-cyan-400/60 font-mono">
                            {mark.label}
                          </div>
                          <div className="absolute left-0 w-3 h-px bg-cyan-400/60"></div>
                        </div>
                      ))}
                    </div>

                    {/* Beaker Top with Enhanced Rim */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-40 h-5 border-t-4 border-x-4 border-gray-300/60 rounded-t-xl bg-gradient-to-b from-gray-400/20 to-transparent"
                         style={{ boxShadow: '0 -8px 30px rgba(255, 0, 255, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.2)' }}></div>
                    
                    {/* Reflection/Shine on Glass */}
                    <div className="absolute top-10 left-8 w-16 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-sm transform -rotate-12 pointer-events-none"></div>
                  </div>

                  {/* Cardano Logo Above - Enhanced */}
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-24 h-24 opacity-30"
                       style={{ animation: 'production-pulse 3s ease-in-out infinite' }}>
                    <img src="/eb89be31-3ac0-4d2d-bc0c-6e4bb2e1b082.svg" alt="Logo" className="w-full h-full drop-shadow-2xl" />
                  </div>

                  {/* Professional Status Display */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="bg-gradient-to-r from-green-500/20 via-green-400/30 to-green-500/20 px-6 py-2 rounded-full border border-green-400/40 backdrop-blur-sm"
                         style={{ animation: 'production-pulse 2s ease-in-out infinite' }}>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-green-300 text-xs font-bold tracking-wider">ACTIVE PRODUCTION</span>
                        <div className="text-[10px] text-green-400/80 font-mono">
                          {(state.currentEmissionRate * 60).toFixed(1)} COKE/min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              
            {/* Floating Stats Overlay */}
            <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-md rounded-xl px-4 py-3 border border-farm-pink/30 shadow-lg">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Power Level</div>
              <div className="text-2xl font-bold text-farm-pink">{state.basePower}</div>
            </div>
            
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md rounded-xl px-4 py-3 border border-farm-cyan/30 shadow-lg">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Pending Rewards</div>
              <div className="text-2xl font-bold text-farm-cyan">{state.pending.toFixed(2)} <span className="text-sm text-gray-500">COKE</span></div>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-xl px-4 py-2 border border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">ACTIVE</span>
            </div>

            {/* Lab Info */}
            <div className="absolute bottom-6 right-6 text-right">
              <div className="text-xs text-gray-600">Farm Level</div>
              <div className="text-lg font-bold text-white">Level 1</div>
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

