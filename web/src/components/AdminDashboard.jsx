
import React, { useState, useEffect } from 'react';

function AdminDashboard({ address }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE;

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load stats
      const statsRes = await fetch(`${API_BASE}/api/admin/stats?address=${address}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else if (statsRes.status === 403) {
        setError('Access denied: Admin only');
        return;
      }

      // Load users
      const usersRes = await fetch(`${API_BASE}/api/admin/users?address=${address}`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Load payments
      const paymentsRes = await fetch(`${API_BASE}/api/admin/payments?address=${address}`);
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }
    } catch (err) {
      console.error('Admin data error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadAdminData();
      // Refresh every 30 seconds
      const interval = setInterval(loadAdminData, 30000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  if (loading && !stats) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 animate-pulse">Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-center">
          <p className="text-red-300 text-lg mb-2">⛔ {error}</p>
          <p className="text-gray-400 text-sm">Only the treasury wallet can access admin features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="card border-farm-pink/30 glow-pink">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-farm-pink to-farm-purple bg-clip-text text-transparent mb-2">
              🔐 Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500">Treasury Wallet Access</p>
          </div>
          <button 
            onClick={loadAdminData}
            className="btn-secondary text-sm"
            disabled={loading}
          >
            {loading ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-farm-pink to-farm-purple text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            📊 Stats
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-farm-pink to-farm-purple text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-farm-pink to-farm-purple text-white'
                : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            💰 Payments ({payments.length})
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="stat-box">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">👥 Total Users</p>
              <p className="text-4xl font-bold text-farm-cyan">{stats.totalUsers}</p>
            </div>

            <div className="stat-box">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">💪 Total Power</p>
              <p className="text-4xl font-bold text-green-400">{formatNumber(stats.totalPower)}</p>
            </div>

            <div className="stat-box glow-pink">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">💰 Total Fees Collected</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-farm-pink to-farm-purple bg-clip-text text-transparent">
                {formatNumber(stats.totalActivationFees)}
              </p>
              <p className="text-sm text-gray-500 mt-1">COKE</p>
            </div>

            <div className="stat-box">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">✅ Total Claimed</p>
              <p className="text-4xl font-bold text-blue-400">{stats.totalClaimed.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">COKE</p>
            </div>

            <div className="stat-box">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">⏳ Total Pending</p>
              <p className="text-4xl font-bold text-yellow-400">{stats.totalPending.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">COKE</p>
            </div>

            <div className="stat-box">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">📊 Emission Rate</p>
              <p className="text-4xl font-bold text-purple-400">{stats.currentEmissionRate}</p>
              <p className="text-sm text-gray-500 mt-1">COKE/sec</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-2 text-gray-400 font-semibold">Address</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-semibold">Power</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-semibold">Claimed</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-semibold">Pending</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-semibold">Share %</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-semibold">Activated</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                    <td className="py-3 px-2 font-mono text-xs text-gray-300">
                      {user.address.slice(0, 15)}...{user.address.slice(-10)}
                    </td>
                    <td className="text-right py-3 px-2 text-green-400 font-semibold">{user.basePower}</td>
                    <td className="text-right py-3 px-2 text-blue-400">{user.totalClaimed.toFixed(2)}</td>
                    <td className="text-right py-3 px-2 text-yellow-400">{user.pending.toFixed(2)}</td>
                    <td className="text-right py-3 px-2 text-purple-400">{user.networkShare.toFixed(4)}%</td>
                    <td className="text-right py-3 px-2 text-gray-500 text-xs">{formatDate(user.activatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center py-8 text-gray-500">No users yet</p>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-2 text-gray-400 font-semibold">TX Hash</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-semibold">Address</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-semibold">Amount</th>
                  <th className="text-center py-3 px-2 text-gray-400 font-semibold">Status</th>
                  <th className="text-right py-3 px-2 text-gray-400 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, i) => (
                  <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                    <td className="py-3 px-2 font-mono text-xs text-gray-300">
                      {payment.tx_hash.slice(0, 15)}...
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-gray-300">
                      {payment.address.slice(0, 15)}...
                    </td>
                    <td className="text-right py-3 px-2 text-farm-pink font-semibold">
                      {formatNumber(payment.amount)}
                    </td>
                    <td className="text-center py-3 px-2">
                      {payment.verified === 1 ? (
                        <span className="text-green-400">✅ Verified</span>
                      ) : (
                        <span className="text-yellow-400">⏳ Pending</span>
                      )}
                    </td>
                    <td className="text-right py-3 px-2 text-gray-500 text-xs">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <p className="text-center py-8 text-gray-500">No payments yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

