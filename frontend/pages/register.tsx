import type { NextPage } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '@/utils/api';
import { useAuthStore } from '@/utils/store';
import { useRouter } from 'next/router';

const Register: NextPage = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ phone_number: '', password: '', confirm_password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', formData);
      setStep(2);
      toast.success('OTP sent to your phone');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/verify-otp', {
        phone_number: formData.phone_number,
        otp_code: otp,
        password: formData.password,
      });
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      toast.success('Account created!');
      router.push('/lobby');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-gold to-simbi-green flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
      >
        <h1 className="text-3xl font-bold text-simbi-black text-center mb-8">🌾 Join SIMBI KE</h1>

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-simbi-black mb-2">Phone Number (Kenya)</label>
              <input
                type="tel"
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border-2 border-simbi-gold rounded focus:outline-none focus:border-simbi-green"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-simbi-black mb-2">Password (min 8 chars)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-simbi-gold rounded focus:outline-none focus:border-simbi-green"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-simbi-black"
                >
                  👁️
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-simbi-black mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-4 py-2 border-2 border-simbi-gold rounded focus:outline-none focus:border-simbi-green"
                required
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" required />
              <span>I confirm I am 18+ and agree to terms</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-simbi-gold text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <p className="text-center text-gray-600 text-sm">Enter the 6-digit code sent to {formData.phone_number}</p>

            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-simbi-gold rounded text-center text-2xl tracking-widest focus:outline-none focus:border-simbi-green"
              required
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-simbi-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-simbi-gold font-semibold py-2"
            >
              ← Back
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link href="/login" className="text-simbi-green font-bold">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
