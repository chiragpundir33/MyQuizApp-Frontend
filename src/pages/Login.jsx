import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative"
      >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-sm text-slate-400">Sign in to access your quizzes and track progress</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 mb-6 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-wider shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
