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
      {/* Wallet Connection - Minimal badge when connected */}
      {lucid && (
        <div className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-md border border-farm-cyan/30 rounded-lg px-3 py-2 shadow-lg shadow-farm-cyan/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">
              <span className="capitalize text-farm-cyan font-medium">Connected</span>
            </span>
            <button
              onClick={() => {
                setLucid(null);
                setAddress(null);
                setHasLab(false);
              }}
              className="ml-2 px-2 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      <div className="flex-grow px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center pt-2 mb-4 relative">
            {/* Top Left Buttons */}
            <div className="absolute top-2 left-0 flex items-center gap-3">
              {/* Buy Token Button */}
              <a
                href="https://app.dexhunter.io/swap?tokenIdSell=6b69aa662bfa64608c15c08c9a72897cb9a3a6d1d1eb2d3cb053b13c434f4b45&tokenIdBuy="
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg transition-all text-sm text-white font-bold flex items-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Buy Token
              </a>

              {/* X (Twitter) Link */}
              <a 
                href="https://x.com/HOOKEDonADA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-farm-cyan rounded-lg transition-all text-gray-400 hover:text-white"
                title="Follow us on X"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>

            {/* Info Button - Top Right */}
            <button
              onClick={() => setShowInfo(true)}
              className="absolute top-2 right-0 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all text-sm text-gray-400 hover:text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </button>

            <div className="flex items-center justify-center -mb-20">
              <img src="/eb89be31-3ac0-4d2d-bc0c-6e4bb2e1b082.svg" alt="Farm Labs" className="w-[600px] h-[600px]" />
            </div>
            <div className="-mb-2">
              <h1 className="text-9xl font-bold font-display tracking-tight animated-title leading-none mb-0">
                HOOKED
              </h1>
              <p className="text-3xl font-medium text-gray-400">
                BY FARM LABS
              </p>
            </div>
            <p className="text-lg text-gray-500 font-light">
              Build your empire on Cardano
            </p>
          </header>

        {/* Wallet Connection - Centered on Page */}
        <div className="flex items-center justify-center min-h-[40vh]">
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

