import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import apiClient from '@/utils/api';
import { useAuthStore, useGameStore } from '@/utils/store';
import { useRouter } from 'next/router';

interface Room {
  id: string;
  stake_amount: number;
  queue_length: number;
  occupancy_percentage: number;
}

const Lobby: NextPage = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');
    fetchRooms();
  }, [user, router]);

  const fetchRooms = async () => {
    try {
      const res = await apiClient.get('/game/rooms');
      setRooms(res.data.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await apiClient.post('/game/join-queue', { room_id: roomId });
      router.push(`/game/${roomId}`);
    } catch (error: any) {
      console.error(error.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-gold to-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-simbi-black">🌾 SIMBI KE Lobby</h1>
          <div className="flex gap-4">
            <Link href="/profile">
              <button className="bg-simbi-green text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                Profile
              </button>
            </Link>
            <Link href="/help">
              <button className="bg-simbi-black text-white px-6 py-2 rounded-lg font-bold hover:opacity-80">
                Help
              </button>
            </Link>
          </div>
        </motion.div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Balance', value: `KES ${user?.balance || 0}`, icon: '💰' },
            { label: 'Wins', value: user?.total_wins || 0, icon: '🏆' },
            { label: 'Losses', value: user?.total_losses || 0, icon: '📉' },
            { label: 'Win Rate', value: `${((user?.total_wins / (user?.total_matches || 1)) * 100).toFixed(1)}%`, icon: '📊' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-simbi-black">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Rooms Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-simbi-black mb-6">Available Rooms</h2>
          {loading ? (
            <div className="text-center py-8">Loading rooms...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <h3 className="text-2xl font-bold text-simbi-green mb-4">Room KES {room.stake_amount}</h3>
                  <div className="space-y-3 mb-6">
                    <p className="text-gray-600">👥 Queue: {room.queue_length}/500</p>
                    <p className="text-gray-600">📊 Occupancy: {room.occupancy_percentage}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-simbi-gold h-2 rounded-full transition-all"
                        style={{ width: `${room.occupancy_percentage}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => joinRoom(room.id)}
                    className="w-full bg-simbi-gold text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition"
                  >
                    Join Queue →
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Lobby;
