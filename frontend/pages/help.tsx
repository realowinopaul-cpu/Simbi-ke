import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Help: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-gold to-simbi-green p-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-simbi-black text-center mb-12"
        >
          🆘 Help & Support
        </motion.h1>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-simbi-black mb-6">📞 Customer Support</h2>
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              <strong>Primary:</strong> <a href="tel:+254748278327" className="text-simbi-green font-bold">+254 748 278 327</a>
            </p>
            <p className="text-lg text-gray-700">
              <strong>Secondary:</strong> <a href="tel:+254786743973" className="text-simbi-green font-bold">+254 786 743 973</a>
            </p>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-simbi-black mb-6">❓ Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How does the maize toss game work?',
                a: 'Four maize cobs with BLACK and WHITE sides are tossed. Winning combinations are: 2W+2B, 4W, or 4B (50% probability). The roller clicks TOSS and results are instant.',
              },
              {
                q: 'What are the deposit charges?',
                a: 'Deposits have a 5% VAT deducted. E.g., deposit KES 100 → KES 95 credited. Minimum: KES 10, Maximum: KES 50,000 daily.',
              },
              {
                q: 'What are withdrawal fees?',
                a: '10% fee deducted from withdrawals. E.g., withdraw KES 1,000 → you receive KES 900. Fees go to system account. Minimum: KES 50, Maximum: KES 100,000.',
              },
              {
                q: 'How often can I withdraw?',
                a: 'Minimum 1-minute interval between withdrawals to prevent abuse.',
              },
              {
                q: 'What payment methods are accepted?',
                a: 'M-Pesa and Airtel Money only. You must use your registered phone number.',
              },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-bold text-lg text-simbi-black mb-2">{faq.q}</h3>
                <p className="text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-simbi-black mb-6">🎮 How to Play</h2>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="text-gray-700"><strong>Register:</strong> Create account with Kenyan phone number</li>
            <li className="text-gray-700"><strong>Deposit:</strong> Add funds via M-Pesa or Airtel Money</li>
            <li className="text-gray-700"><strong>Join Room:</strong> Select a stake room (KES 10 to 20,000)</li>
            <li className="text-gray-700"><strong>Wait in Queue:</strong> See your position in real-time</li>
            <li className="text-gray-700"><strong>Play Match:</strong> When matched, one player tosses</li>
            <li className="text-gray-700"><strong>Result:</strong> Instant win/loss → funds transferred</li>
            <li className="text-gray-700"><strong>Next Round:</strong> Auto-match after 5 seconds or return to lobby</li>
          </ol>
        </motion.div>

        {/* Responsible Gaming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-simbi-red text-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">⚠️ Responsible Gaming</h2>
          <ul className="space-y-3 list-disc list-inside">
            <li>Only bet what you can afford to lose</li>
            <li>Set daily loss limits in your profile</li>
            <li>Take regular breaks</li>
            <li>Never chase losses</li>
            <li>If gambling becomes a problem, use self-exclusion option</li>
          </ul>
        </motion.div>

        {/* Social */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-simbi-black mb-6">📱 Follow Us</h2>
          <div className="flex justify-center gap-6 text-2xl">
            <a href="https://twitter.com/SimbiKE" target="_blank" rel="noopener" className="hover:opacity-70">𝕏</a>
            <a href="https://facebook.com/SimbiKE" target="_blank" rel="noopener" className="hover:opacity-70">f</a>
            <a href="https://tiktok.com/@SimbiKE" target="_blank" rel="noopener" className="hover:opacity-70">♪</a>
            <a href="https://instagram.com/SimbiKE" target="_blank" rel="noopener" className="hover:opacity-70">📷</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
