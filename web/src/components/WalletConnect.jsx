import React, { useState, useEffect } from 'react';
import { getAvailableWallets, connectWallet } from '../lib/lucid';

function WalletConnect({ onConnect, onDisconnect }) {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Discover available wallets
    const discovered = getAvailableWallets();
    setWallets(discovered);
  }, []);

  const handleConnect = async (walletName) => {
    setConnecting(true);
    setError(null);
    
    try {
      const lucid = await connectWallet(walletName);
      setSelectedWallet(walletName);
      setIsConnected(true);
      onConnect(lucid);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setSelectedWallet(null);
    setIsConnected(false);
    onDisconnect();
  };

  if (isConnected) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg">
              Connected: <span className="font-bold capitalize">{selectedWallet}</span>
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="btn-secondary"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}

      {wallets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No Cardano wallets detected</p>
          <p className="text-sm text-gray-500">
            Please install a CIP-30 compatible wallet extension
            <br />
            (Nami, Eternl, Flint, Lace, etc.)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              disabled={connecting}
              className="flex items-center gap-3 p-4 bg-gray-900 hover:bg-gray-700 rounded-lg transition-all border border-gray-700 hover:border-coke-red disabled:opacity-50"
            >
              {wallet.icon && (
                <img 
                  src={wallet.icon} 
                  alt={wallet.displayName}
                  className="w-8 h-8"
                />
              )}
              <span className="font-semibold capitalize">
                {wallet.displayName}
              </span>
            </button>
          ))}
        </div>
      )}

      {connecting && (
        <div className="text-center mt-4">
          <p className="text-gray-400 animate-pulse">Connecting...</p>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;

