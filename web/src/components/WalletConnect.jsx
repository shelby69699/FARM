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
      <div className="card border-farm-cyan/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-lg text-gray-300">
              Connected: <span className="font-bold capitalize text-farm-cyan">{selectedWallet}</span>
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
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-farm-cyan to-farm-purple bg-clip-text text-transparent">Connect Wallet</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4">
          <p className="text-red-300">❌ {error}</p>
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
              className="flex items-center gap-3 p-4 bg-black hover:bg-zinc-900 rounded-xl transition-all border border-zinc-800 hover:border-farm-cyan disabled:opacity-50 group"
            >
              {wallet.icon && (
                <img 
                  src={wallet.icon} 
                  alt={wallet.displayName}
                  className="w-8 h-8 group-hover:scale-110 transition-transform"
                />
              )}
              <span className="font-semibold capitalize text-gray-300 group-hover:text-white transition-colors">
                {wallet.displayName}
              </span>
            </button>
          ))}
        </div>
      )}

      {connecting && (
        <div className="text-center mt-4">
          <p className="text-farm-cyan animate-pulse">Connecting...</p>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;

