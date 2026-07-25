import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import apiClient from '@/utils/api';
import { useAuthStore } from '@/utils/store';

const GameBoard: NextPage = () => {
  const router = useRouter();
  const { matchId } = router.query;
  const user = useAuthStore((state) => state.user);
  const [socket, setSocket] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [tossing, setTossing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to game server');
      setLoading(false);
    });

    newSocket.on('match_started', (matchData) => {
      setMatch(matchData);
    });

    newSocket.on('toss_completed', (data) => {
      setResult(data);
      setTossing(false);
      setTimeout(() => {
        router.push('/lobby');
      }, 5000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, router]);

  const handleToss = () => {
    if (!match) return;
    setTossing(true);
    socket.emit('toss_maize', matchId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-simbi-gold to-simbi-green flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-3xl mb-4">🌾</p>
          <p className="text-xl font-bold">Loading Game Board...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-simbi-gold to-simbi-green flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-3xl mb-4">⏳</p>
          <p className="text-xl font-bold">Waiting for match...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-black to-simbi-gold p-4 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Players */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {[match.player1_id, match.player2_id].map((playerId, i) => (
            <div
              key={i}
              className={`text-center p-6 rounded-lg ${
                playerId === user?.id ? 'bg-simbi-gold text-black' : 'bg-white text-black'
              }`}
            >
              <p className="text-sm font-semibold opacity-75">Player {i + 1}</p>
              <p className="text-2xl font-bold">{playerId === user?.id ? 'YOU' : 'OPPONENT'}</p>
              {match.roller_id === playerId && <p className="text-xs mt-2 bg-black bg-opacity-20 inline-block px-2 py-1 rounded">🎲 Roller</p>}
            </div>
          ))}
        </div>

        {/* Maize Toss Animation */}
        <motion.div
          className="flex justify-center gap-6 mb-12"
          animate={tossing ? { rotateX: 360, rotateY: 360 } : {}}
          transition={{ duration: 1.5, repeat: tossing ? 1 : 0 }}
        >
          {result ? (
            result.result.map((maize: string, i: number) => (
              <motion.div
                key={i}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl font-bold ${
                  maize === 'WHITE' ? 'bg-white text-black' : 'bg-simbi-black text-white'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {maize === 'WHITE' ? '⚪' : '⚫'}
              </motion.div>
            ))
          ) : (
            [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-simbi-black animate-pulse"
              />
            ))
          )}
        </motion.div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold text-simbi-gold mb-4">
              {result.winner_id === user?.id ? '🎉 YOU WON! 🎉' : '😢 YOU LOST'}
            </h2>
            <p className="text-white text-2xl font-bold">{result.winner_id === user?.id ? '+' : '-'} KES {result.amount_won}</p>
          </motion.div>
        )}

        {/* Action Button */}
        <div className="text-center">
          {match.roller_id === user?.id && !result ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToss}
              disabled={tossing}
              className="bg-simbi-gold text-black px-12 py-4 rounded-lg font-bold text-xl hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {tossing ? '🎲 TOSSING...' : '🎲 TOSS MAIZE'}
            </motion.button>
          ) : !result ? (
            <div className="text-white text-xl font-bold">
              ⏳ Waiting for opponent to toss...
            </div>
          ) : (
            <div className="text-white text-lg">
              Returning to lobby in 5 seconds...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GameBoard;
