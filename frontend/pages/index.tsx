import type { NextPage } from 'next';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-gold via-white to-simbi-green flex flex-col justify-center items-center px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-simbi-black mb-4">
          🌾 SIMBI KE 🌾
        </h1>
        <p className="text-2xl text-simbi-green font-semibold">Kenyan PvP Maize-Toss Wagering</p>
        <p className="text-lg text-gray-600 mt-2">Toss. Win. Earn.</p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex gap-6 mb-12"
      >
        <Link href="/register">
          <button className="bg-simbi-gold text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition shadow-lg">
            Register Now
          </button>
        </Link>
        <Link href="/login">
          <button className="bg-simbi-green text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg">
            Login
          </button>
        </Link>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
      >
        {[
          { icon: '🎲', title: 'Fair Gaming', desc: 'Cryptographically secure 50-50 outcomes' },
          { icon: '⚡', title: '5-Second Rounds', desc: 'Fast-paced action non-stop' },
          { icon: '💳', title: 'Easy Payment', desc: 'M-Pesa & Airtel Money integration' },
        ].map((feature, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-4xl mb-2">{feature.icon}</p>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-gray-600">
        <p>18+ Only | Play Responsibly</p>
      </div>
    </div>
  );
};

export default Home;
