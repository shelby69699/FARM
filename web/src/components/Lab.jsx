import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AdminDashboard from './AdminDashboard';
import BoosterPack from './BoosterPack';

// Simple rotating production tank
function ProductionTank({ pending }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const fillLevel = Math.min(pending / 100, 1);

  return (
    <group>
      {/* Main Tank */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Liquid */}
      {fillLevel > 0 && (
        <mesh position={[0, -1 + fillLevel, 0]}>
          <cylinderGeometry args={[0.9, 0.9, fillLevel * 2, 32]} />
          <meshStandardMaterial 
            color="#ff0080"
            emissive="#ff0080"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

// Power Generator
function PowerGenerator({ basePower }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={[-3, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

// Network Bars
function NetworkBars({ networkShare }) {
  return (
    <group position={[3, 0, 0]}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[(i - 5) * 0.3, 0, 0]}>
          <boxGeometry args={[0.2, networkShare * 5, 0.2]} />
          <meshStandardMaterial 
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main 3D Scene
function Lab3DScene({ state }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      
      <ProductionTank pending={state.pending} />
      <PowerGenerator basePower={state.basePower} />
      <NetworkBars networkShare={state.networkShare} />
      
      <OrbitControls 
        enablePan={false}
        minDistance={5}
        maxDistance={12}
      />
    </>
  );
}

// Main Lab Component
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-farm-pink mb-4"></div>
          <p className="text-gray-400">Loading your laboratory...</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400">Failed to load laboratory state</p>
          <button onClick={onBack} className="mt-4 text-farm-cyan hover:text-farm-pink transition-colors">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const farmingPerDay = (state.currentEmissionRate * state.networkShare / 100 * 86400).toFixed(2);
  const farmingPerHour = (state.currentEmissionRate * state.networkShare / 100 * 3600).toFixed(1);

  return (
    <div className="min-h-screen bg-black pb-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-farm-purple/20 via-black to-farm-cyan/20"></div>
      </div>

      {/* Show Admin Dashboard if toggled */}
      {isAdmin && showAdmin ? (
        <div className="relative z-10 space-y-4">
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
          <div className="relative z-10 flex items-center justify-between mb-6 px-4 py-3 bg-black/80 backdrop-blur-md border-b border-farm-cyan/20">
            <div className="flex items-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 rounded-lg bg-zinc-900/50 border border-farm-cyan/30 hover:border-farm-cyan transition-all text-gray-400 hover:text-farm-cyan"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-farm-cyan via-farm-purple to-farm-pink">
                  3D PRODUCTION LABORATORY
                </h1>
                <p className="text-sm text-farm-cyan/60">Level 1 Facility • Active Production</p>
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

          {/* Main Content Grid */}
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-6 px-4">
            
            {/* LEFT COLUMN - 3D Viewport */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* 3D Canvas Container */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-farm-cyan via-farm-purple to-farm-pink rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-black rounded-2xl border border-farm-cyan/30 overflow-hidden" style={{ height: '600px' }}>
                  <Canvas
                    camera={{ position: [0, 2, 8], fov: 50 }}
                  >
                    <Lab3DScene state={state} />
                  </Canvas>
                  
                  {/* 3D Viewport HUD Overlay */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-farm-cyan/30 rounded-lg px-4 py-2">
                    <div className="text-xs text-farm-cyan font-mono">3D VIEWPORT</div>
                    <div className="text-[10px] text-gray-500">Drag to rotate • Scroll to zoom</div>
                  </div>

                  {/* Live Production Indicator */}
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-xs text-green-400 font-mono">PRODUCTION ACTIVE</div>
                  </div>

                  {/* Production Rate Display */}
                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-farm-pink/30 rounded-lg px-4 py-3">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Current Output</div>
                    <div className="text-2xl font-bold text-farm-pink">{farmingPerHour}</div>
                    <div className="text-xs text-gray-400">COKE per hour</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-black/60 backdrop-blur-sm border border-farm-cyan/30 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Network Share</div>
                  <div className="text-xl font-bold text-farm-cyan">{state.networkShare.toFixed(4)}%</div>
                </div>
                <div className="bg-black/60 backdrop-blur-sm border border-farm-pink/30 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Grow Power</div>
                  <div className="text-xl font-bold text-farm-pink">{state.basePower}</div>
                </div>
                <div className="bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Total Claimed</div>
                  <div className="text-xl font-bold text-green-400">{state.totalClaimed.toFixed(1)}</div>
                </div>
                <div className="bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Daily Rate</div>
                  <div className="text-xl font-bold text-yellow-400">{farmingPerDay}</div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - Controls & Info */}
            <div className="space-y-6">
              
              {/* Claim Rewards Panel */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 border border-farm-pink/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-farm-pink rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Rewards</span>
                  </div>
                  
                  <div className="text-5xl font-bold bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan bg-clip-text text-transparent mb-1">
                    {state.pending.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium mb-6">COKE</div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-red-300 text-xs">❌ {error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-4">
                      <p className="text-green-300 text-xs">✅ {success}</p>
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
                        Processing...
                      </span>
                    ) : state.pending <= 0 ? (
                      'No Rewards Available'
                    ) : (
                      `Claim ${state.pending.toFixed(2)} COKE`
                    )}
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-black/60 backdrop-blur-sm border border-farm-cyan/30 rounded-xl p-5">
                <h3 className="text-sm font-bold text-farm-cyan uppercase tracking-wider mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-xs text-gray-400">Emission Rate</span>
                    <span className="text-sm font-mono text-white">{state.currentEmissionRate.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-xs text-gray-400">Lab Activated</span>
                    <span className="text-sm font-mono text-white">{formatDate(state.activatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-400">Next Halving</span>
                    <span className="text-sm font-mono text-orange-400">{formatTimeUntil(state.nextHalvingTimestamp)}</span>
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

              {/* Warning Banner */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg px-4 py-3 text-center">
                <div className="text-xs text-yellow-400 font-bold uppercase tracking-wide">
                  ⚠ Unauthorized Production Facility
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
