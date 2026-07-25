import type { NextPage } from 'next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import apiClient from '@/utils/api';
import { useAuthStore } from '@/utils/store';
import { useRouter } from 'next/router';

const Withdraw: NextPage = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 50 || parseFloat(amount) > 100000) {
      toast.error('Amount must be between KES 50 and KES 100,000');
      return;
    }

    const totalDeduction = parseFloat(amount) + parseFloat(amount) * 0.1;
    if (user?.balance < totalDeduction) {
      toast.error(`Insufficient balance. You have KES ${user?.balance}`);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/payment/withdraw', {
        amount: parseFloat(amount),
        payment_method: paymentMethod,
      });
      setSubmitted(true);
      toast.success('Withdrawal initiated!');
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-green to-white p-4">
      <div className="max-w-md mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-simbi-black text-center mb-8">💸 Withdraw Funds</h1>

          {submitted ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">✅</p>
              <p className="text-xl font-bold text-simbi-green mb-2">Withdrawal Initiated!</p>
              <p className="text-gray-600 mb-4">Funds will be sent to {user?.phone_number}</p>
              <p className="text-sm text-gray-500">Redirecting to profile...</p>
            </div>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-gray-700">💰 <strong>Available Balance:</strong> KES {user?.balance}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-simbi-black mb-2">Withdrawal Amount (KES)</label>
                <input
                  type="number"
                  min="50"
                  max="100000"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-simbi-green rounded text-xl focus:outline-none focus:border-simbi-gold"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Min: KES 50 | Max: KES 100,000 | Fee: 10%</p>
              </div>

              {amount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Withdrawal Amount</span>
                    <span className="font-bold">KES {parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Processing Fee (10%)</span>
                    <span className="font-bold text-simbi-red">-KES {(parseFloat(amount) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold text-gray-800">Total Deducted</span>
                    <span className="font-bold text-simbi-red">-KES {(parseFloat(amount) * 1.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-800">You'll Receive</span>
                    <span className="font-bold text-simbi-green">KES {parseFloat(amount).toFixed(2)}</span>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-simbi-black mb-2">Payment Method</label>
                <div className="space-y-2">
                  {['MPESA', 'AIRTEL_MONEY'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded cursor-pointer hover:border-simbi-green transition">
                      <input
                        type="radio"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="font-semibold">{method === 'MPESA' ? 'M-Pesa' : 'Airtel Money'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-sm text-gray-700">⚠️ <strong>Note:</strong> Processing fee goes to system account. Minimum 1-minute cooldown between withdrawals.</p>
              </div>

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-simbi-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Withdraw Now'}
              </button>

              <Link href="/profile">
                <button type="button" className="w-full text-simbi-green font-semibold py-2">
                  ← Back to Profile
                </button>
              </Link>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Withdraw;
