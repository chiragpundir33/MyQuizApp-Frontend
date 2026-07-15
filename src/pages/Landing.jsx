import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ShieldAlert, Award, Compass, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Interactive Quizzes',
      desc: 'Engage with custom quizzes categorized by multiple domains and difficulty levels.',
      icon: Compass,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Live Leaderboard',
      desc: 'Compete globally and verify your ranking dynamically against top quiz takers.',
      icon: Award,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Secure Accounts',
      desc: 'Powered by stateless JWT security for protected administration and profile stats.',
      icon: ShieldAlert,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 w-full max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-500/20">
            <Award size={22} className="animate-spin-slow" />
          </div>
          <span className="font-bold text-xl text-white tracking-wider">QuizPortal</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-800/80 transition-all font-medium text-sm"
        >
          Sign In
        </button>
      </header>

      {/* Main Hero & CTA Card */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center relative z-10 text-center">
        {/* Title & Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold tracking-wider uppercase inline-block">
            Elevate Your Knowledge
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master Any Topic With <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Interactive Quizzing
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Test your limits, evaluate statistics, view custom leaderboards, and master multiple domains in our premium quiz platform.
          </p>
        </motion.div>

        {/* CTA Card Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-12 w-full max-w-md p-8 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md shadow-2xl relative group"
        >
          {/* Accent hover glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />
          
          <div className="relative space-y-6">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Play size={24} fill="currentColor" className="ml-0.5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Ready to challenge yourself?</h3>
              <p className="text-sm text-slate-400">Join thousands of students and developers currently grading their skills.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold tracking-wider shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              Get Started Now
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {features.map((feat, index) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3, duration: 0.5 }}
              className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-left backdrop-blur-sm relative"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center mb-4 shadow-md`}>
                <feat.icon size={20} />
              </div>
              <h4 className="font-bold text-lg text-white mb-2">{feat.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} QuizPortal. All rights reserved. Built with React & Tailwind CSS.
      </footer>
    </div>
  );
}
