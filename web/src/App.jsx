import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import BalanceCard from './components/BalanceCard';
import StartLab from './components/StartLab';
import Lab from './components/Lab';
import AdminDashboard from './components/AdminDashboard';
import InfoPage from './components/InfoPage';

// Polyfill for browser
import { Buffer } from 'buffer';
window.Buffer = Buffer;

function App() {
  const [lucid, setLucid] = useState(null);
  const [address, setAddress] = useState(null);
  const [hasLab, setHasLab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;
  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

  // Check if user has an active lab (auto-activate admin)
  const checkLabStatus = async (userAddress) => {
    try {
      const response = await fetch(`${API_BASE}/api/state/${userAddress}`);
      if (response.ok) {
        setHasLab(true);
      } else {
        setHasLab(false);
        
        // Auto-activate admin wallet
        if (userAddress === TREASURY_ADDRESS) {
          console.log('🔐 Auto-activating admin wallet...');
          try {
            const activateRes = await fetch(`${API_BASE}/api/start`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: userAddress })
            });
            
            if (activateRes.ok) {
              console.log('✅ Admin farm auto-activated');
              setHasLab(true);
            } else {
              const error = await activateRes.json();
              console.error('Admin auto-activation failed:', error);
            }
          } catch (err) {
            console.error('Admin auto-activation error:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error checking lab status:', error);
      setHasLab(false);
    }
  };

  // When wallet connects, get address and check lab status
  useEffect(() => {
    if (lucid) {
      lucid.wallet.address().then(addr => {
        setAddress(addr);
        setIsAdmin(addr === TREASURY_ADDRESS);
        checkLabStatus(addr);
      });
    }
  }, [lucid]);

  const handleLabActivated = () => {
    setHasLab(true);
  };

  // Show info page if toggled
  if (showInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
        <InfoPage onClose={() => setShowInfo(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      <div className="flex-grow py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-24 relative">
            {/* Info Button - Top Right */}
            <button
              onClick={() => setShowInfo(true)}
              className="absolute top-0 right-0 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all text-sm text-gray-400 hover:text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </button>

            <div className="flex items-center justify-center mb-3">
              <img src="/eb89be31-3ac0-4d2d-bc0c-6e4bb2e1b082.svg" alt="Farm Labs" className="w-96 h-96" />
            </div>
            <div className="mb-4">
              <h1 className="text-9xl font-bold font-display tracking-tight animated-title leading-none">
                HOOKED
              </h1>
              <p className="text-3xl font-medium text-gray-400 mt-2">
                BY FARM LABS
              </p>
            </div>
            <p className="text-lg text-gray-500 font-light">
              Build your empire on Cardano
            </p>
          </header>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnect 
            onConnect={setLucid} 
            onDisconnect={() => {
              setLucid(null);
              setAddress(null);
              setHasLab(false);
            }}
          />
        </div>

        {/* Connected State */}
        {lucid && address && (
          <>
            {/* If user has lab, show ONLY the lab dashboard (including admin) */}
                {hasLab ? (
                  <Lab 
                    address={address}
                    onBack={() => setHasLab(false)}
                    isAdmin={isAdmin}
                    lucid={lucid}
                  />
                ) : (
              <>
                {/* Balance Card */}
                <div className="mb-8">
                  <BalanceCard lucid={lucid} address={address} />
                </div>

                {/* Start Lab */}
                <StartLab 
                  lucid={lucid} 
                  address={address}
                  onLabActivated={handleLabActivated}
                />
              </>
            )}
          </>
        )}

        {/* Not Connected State */}
        {!lucid && (
          <div className="mb-8">
            {/* Placeholder - wallet not connected */}
          </div>
        )}

        </div>
      </div>
      
      {/* Footer - Fixed at bottom */}
      <footer className="py-6 text-center border-t border-zinc-900">
        <p className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <span>Powered by</span>
          <span className="text-farm-pink font-medium">Farm Labs</span>
          <span>•</span>
          <span>Built on</span>
          <span className="text-farm-cyan font-medium">Cardano</span>
        </p>
      </footer>
    </div>
  );
}

export default App;

