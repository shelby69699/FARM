import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere, Environment } from '@react-three/drei';
import * as THREE from 'three';
import AdminDashboard from './AdminDashboard';
import BoosterPack from './BoosterPack';

// 3D Production Tank Component
function ProductionTank({ pending, maxCapacity = 100 }) {
  const meshRef = useRef();
  const liquidRef = useRef();
  const fillLevel = Math.min(pending / maxCapacity, 1);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
    if (liquidRef.current && fillLevel > 0) {
      liquidRef.current.position.y = -1.5 + (fillLevel * 2.5);
      liquidRef.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Tank Body */}
      <Cylinder ref={meshRef} args={[1.2, 1.2, 3, 32]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.3}
          transmission={0.9}
          thickness={0.5}
        />
      </Cylinder>

      {/* Liquid Inside */}
      {fillLevel > 0 && (
        <Cylinder ref={liquidRef} args={[1.1, 1.1, 2.5 * fillLevel, 32]} position={[0, -1.5, 0]}>
          <meshPhysicalMaterial
            color="#ff0080"
            emissive="#ff0080"
            emissiveIntensity={0.5}
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </Cylinder>
      )}

      {/* Top Cap */}
      <Cylinder args={[1.3, 1.3, 0.2, 32]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Bottom Cap */}
      <Cylinder args={[1.3, 1.3, 0.2, 32]} position={[0, -1.6, 0]}>
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Pipes */}
      <Cylinder args={[0.1, 0.1, 2, 16]} position={[1.4, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.3} />
      </Cylinder>
      
      {/* Warning Label - Removed text to avoid font loading issues */}
      {/* Fill Level shown in HUD instead */}
    </group>
  );
}

// Power Generator Component
function PowerGenerator({ basePower }) {
  const coreRef = useRef();
  const ringsRef = useRef([]);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.01;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      const intensity = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      coreRef.current.material.emissiveIntensity = intensity;
    }
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.y += 0.02 * (i + 1);
        ring.rotation.x = Math.sin(state.clock.elapsedTime + i) * 0.2;
      }
    });
  });

  return (
    <group position={[-3, 0.5, 0]}>
      {/* Core Sphere */}
      <Sphere ref={coreRef} args={[0.4, 32, 32]}>
        <meshPhysicalMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Rotating Rings */}
      {[0, 1, 2].map((i) => (
        <group key={i} ref={(el) => (ringsRef.current[i] = el)}>
          <mesh rotation={[Math.PI / 2, 0, (Math.PI / 3) * i]}>
            <torusGeometry args={[0.6 + i * 0.2, 0.05, 16, 100]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Power display shown in HUD */}

      {/* Base Platform */}
      <Cylinder args={[0.8, 0.8, 0.2, 32]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
      </Cylinder>
    </group>
  );
}

// Network Share Visualizer
function NetworkVisualizer({ networkShare }) {
  const barsRef = useRef([]);
  const barCount = 20;

  useFrame((state) => {
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        const targetHeight = (networkShare * 10) * (Math.sin(i * 0.5 + state.clock.elapsedTime * 2) * 0.5 + 1);
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetHeight, 0.1);
        bar.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3 + i * 0.3) * 0.3;
      }
    });
  });

  return (
    <group position={[3, -0.5, 0]}>
      {Array.from({ length: barCount }).map((_, i) => (
        <Box
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          args={[0.1, 1, 0.1]}
          position={[(i - barCount / 2) * 0.15, 0.5, 0]}
        >
          <meshPhysicalMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
      ))}
      {/* Network display shown in HUD */}
    </group>
  );
}

// Floating Particles
function Particles() {
  const particlesRef = useRef();
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Lab Floor
function LabFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Grid lines */}
      <gridHelper args={[20, 20, '#00ffff', '#333333']} position={[0, -1.99, 0]} />
    </>
  );
}

// 3D Scene Component
function Lab3DScene({ state }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#00ffff" />
      <pointLight position={[-5, 2, -5]} intensity={0.5} color="#ff00ff" />
      <pointLight position={[5, 2, 5]} intensity={0.5} color="#ffaa00" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        castShadow
        color="#ffffff"
      />

      {/* Environment */}
      <Environment preset="night" />

      {/* Lab Floor */}
      <LabFloor />

      {/* Particles */}
      <Particles />

      {/* Production Tank */}
      <ProductionTank pending={state.pending} maxCapacity={100} />

      {/* Power Generator */}
      <PowerGenerator basePower={state.basePower} />

      {/* Network Visualizer */}
      <NetworkVisualizer networkShare={state.networkShare} />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// Loading Component for 3D Scene
function Scene3DLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-farm-cyan mb-4"></div>
        <p className="text-gray-400">Initializing 3D Laboratory...</p>
      </div>
    </div>
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
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)',
        }}></div>
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
          {/* Top Bar - HUD Style */}
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
                    camera={{ position: [0, 3, 8], fov: 50 }}
                    shadows
                    gl={{ antialias: true, alpha: true }}
                  >
                    <Suspense fallback={null}>
                      <Lab3DScene state={state} />
                    </Suspense>
                  </Canvas>
                  
                  {/* 3D Viewport HUD Overlay */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-farm-cyan/30 rounded-lg px-4 py-2">
                    <div className="text-xs text-farm-cyan font-mono">3D VIEWPORT</div>
                    <div className="text-[10px] text-gray-500">Use mouse to rotate • Scroll to zoom</div>
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
