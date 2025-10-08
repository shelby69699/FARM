import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import BalanceCard from './components/BalanceCard';
import StartLab from './components/StartLab';
import Lab from './components/Lab';

function App() {
  const [lucid, setLucid] = useState(null);
  const [address, setAddress] = useState(null);
  const [hasLab, setHasLab] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;

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
        checkLabStatus(addr);
      });
    }
  }, [lucid]);

  const handleLabActivated = () => {
    setHasLab(true);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-coke-red to-red-600 bg-clip-text text-transparent">
            🧪 Coke Lab
          </h1>
          <p className="text-xl text-gray-400">
            Stake COKE tokens, grow your lab, earn rewards
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
            {/* Balance Card */}
            <div className="mb-8">
              <BalanceCard lucid={lucid} address={address} />
            </div>

            {/* Start Lab or Lab Dashboard */}
            {!hasLab ? (
              <StartLab 
                lucid={lucid} 
                address={address}
                onLabActivated={handleLabActivated}
              />
            ) : (
              <Lab 
                address={address}
              />
            )}
          </>
        )}

        {/* Not Connected State */}
        {!lucid && (
          <div className="card text-center py-12">
            <p className="text-2xl text-gray-400 mb-4">
              👆 Connect your wallet to get started
            </p>
            <p className="text-gray-500">
              You'll need COKE tokens to activate your lab
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by Cardano • Built with Lucid & React</p>
          <p className="mt-2">
            Network: {import.meta.env.VITE_NETWORK}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

