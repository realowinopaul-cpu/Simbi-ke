import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import apiClient from '@/utils/api';
import { useAuthStore } from '@/utils/store';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const Profile: NextPage = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');
    fetchGameHistory();
  }, [user, router]);

  const fetchGameHistory = async () => {
    try {
      const res = await apiClient.get('/game/history?limit=20');
      setHistory(res.data.game_history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-gold to-simbi-green p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-simbi-black mb-2">{user?.username}</h1>
              <p className="text-gray-600">📞 {user?.phone_number}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-simbi-red text-white px-6 py-2 rounded-lg font-bold hover:opacity-80"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Balance', value: `KES ${user?.balance}`, color: 'simbi-gold' },
            { label: 'Total Wins', value: user?.total_wins, color: 'simbi-green' },
            { label: 'Total Losses', value: user?.total_losses, color: 'simbi-red' },
            { label: 'Matches Played', value: user?.total_matches, color: 'simbi-black' },
          ].map((stat, i) => (
            <div key={i} className={`bg-${stat.color} text-white rounded-lg shadow-lg p-6 text-center`}>
              <p className="text-gray-100 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex gap-4 mb-6 border-b-2">
            {['stats', 'history', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-bold transition ${
                  activeTab === tab
                    ? 'text-simbi-gold border-b-2 border-simbi-gold'
                    : 'text-gray-600 hover:text-simbi-black'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Win Rate</span>
                <span className="font-bold">{((user?.total_wins / (user?.total_matches || 1)) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Wagered</span>
                <span className="font-bold">KES {user?.total_wagered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Winnings</span>
                <span className="font-bold text-simbi-green">KES {user?.total_winnings}</span>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-gray-600">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-center text-gray-600">No games played yet</p>
              ) : (
                history.map((game, i) => (
                  <div key={i} className="flex justify-between p-4 bg-gray-50 rounded">
                    <div>
                      <p className="font-bold text-simbi-black">Room KES {game.stake_amount}</p>
                      <p className="text-sm text-gray-600">vs Opponent • {new Date(game.played_at).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-bold text-lg ${
                      game.winner_id === user?.id ? 'text-simbi-green' : 'text-simbi-red'
                    }`}>
                      {game.winner_id === user?.id ? '+' : '-'} KES {game.stake_amount}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/deposit">
                  <button className="w-full bg-simbi-gold text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition">
                    💰 Deposit
                  </button>
                </Link>
                <Link href="/withdraw">
                  <button className="w-full bg-simbi-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                    💸 Withdraw
                  </button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
