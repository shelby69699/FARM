import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import BalanceCard from './components/BalanceCard';
import StartLab from './components/StartLab';
import Lab from './components/Lab';
import AdminDashboard from './components/AdminDashboard';

// Polyfill for browser
import { Buffer } from 'buffer';
window.Buffer = Buffer;

function App() {
  const [lucid, setLucid] = useState(null);
  const [address, setAddress] = useState(null);
  const [hasLab, setHasLab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      <div className="flex-grow py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-24">
            <div className="flex items-center justify-center mb-3">
              <img src="/eb89be31-3ac0-4d2d-bc0c-6e4bb2e1b082.svg" alt="Farm Labs" className="w-80 h-80" />
            </div>
            <h1 className="text-8xl font-bold mb-4 font-display tracking-tight animated-title">
              FARM LABS
            </h1>
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

