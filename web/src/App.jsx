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

  // Check if user has an active lab
  const checkLabStatus = async (userAddress) => {
    try {
      const response = await fetch(`${API_BASE}/api/state/${userAddress}`);
      if (response.ok) {
        setHasLab(true);
      } else {
        setHasLab(false);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-zinc-900 to-black">
      <div className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <img src="/13892451-72e9-4ce0-a737-b8b5e1a68602.SVG.png" alt="Farm Labs" className="w-32 h-32" />
            </div>
            <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan bg-clip-text text-transparent font-display tracking-tight">
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
            {/* Admin Only View (Treasury Wallet) */}
            {isAdmin ? (
              <div className="mb-8">
                <AdminDashboard address={address} />
              </div>
            ) : (
              <>
                {/* If user has lab, show ONLY the lab dashboard */}
                {hasLab ? (
                  <Lab 
                    address={address}
                    onBack={() => setHasLab(false)}
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
          <span className="text-farm-cyan font-medium">Cardano</span>
          <span>•</span>
          <span>Built by</span>
          <span className="text-farm-pink font-medium">Farm Labs</span>
        </p>
      </footer>
    </div>
  );
}

export default App;

