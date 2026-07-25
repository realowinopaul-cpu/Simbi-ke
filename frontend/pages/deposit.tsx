import type { NextPage } from 'next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import apiClient from '@/utils/api';
import { useAuthStore } from '@/utils/store';
import { useRouter } from 'next/router';

const Deposit: NextPage = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 10 || parseFloat(amount) > 50000) {
      toast.error('Amount must be between KES 10 and KES 50,000');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/payment/deposit', {
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        phone_number: user?.phone_number,
      });
      setSubmitted(true);
      toast.success('Deposit initiated! Check your phone.');
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-gold to-white p-4">
      <div className="max-w-md mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-simbi-black text-center mb-8">💰 Deposit Funds</h1>

          {submitted ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-4">✅</p>
              <p className="text-xl font-bold text-simbi-green mb-2">Deposit Initiated!</p>
              <p className="text-gray-600 mb-4">Check your phone for M-Pesa/Airtel prompt</p>
              <p className="text-sm text-gray-500">Redirecting to profile...</p>
            </div>
          ) : (
            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-simbi-black mb-2">Amount (KES)</label>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-simbi-gold rounded text-xl focus:outline-none focus:border-simbi-green"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Min: KES 10 | Max: KES 50,000 | VAT: 5%</p>
              </div>

              {amount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold">KES {parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">VAT (5%)</span>
                    <span className="font-bold text-simbi-red">-KES {(parseFloat(amount) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold text-gray-800">You'll Get</span>
                    <span className="font-bold text-simbi-green">KES {(parseFloat(amount) * 0.95).toFixed(2)}</span>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-simbi-black mb-2">Payment Method</label>
                <div className="space-y-2">
                  {['MPESA', 'AIRTEL_MONEY'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded cursor-pointer hover:border-simbi-gold transition">
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

              <p className="text-xs text-gray-600 text-center">You'll receive a prompt on {user?.phone_number}</p>

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-simbi-gold text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
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

export default Deposit;
