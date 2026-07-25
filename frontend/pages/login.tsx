import type { NextPage } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '@/utils/api';
import { useAuthStore } from '@/utils/store';
import { useRouter } from 'next/router';

const Login: NextPage = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({ phone_number: '', password: '', remember_me: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', formData);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      toast.success('Welcome back!');
      router.push('/lobby');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-simbi-green to-simbi-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
      >
        <h1 className="text-3xl font-bold text-simbi-black text-center mb-8">🌾 Welcome Back</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-simbi-black mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-4 py-2 border-2 border-simbi-green rounded focus:outline-none focus:border-simbi-gold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-simbi-black mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border-2 border-simbi-green rounded focus:outline-none focus:border-simbi-gold"
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

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.remember_me}
              onChange={(e) => setFormData({ ...formData, remember_me: e.target.checked })}
            />
            <span className="text-gray-600">Remember me for 30 days</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-simbi-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          No account yet? <Link href="/register" className="text-simbi-gold font-bold">Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
