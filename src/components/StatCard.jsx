import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color }) {
  // Map color names to classes
  const colorMap = {
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      iconBg: 'bg-purple-500/20',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      iconBg: 'bg-emerald-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      iconBg: 'bg-blue-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      iconBg: 'bg-amber-500/20',
    },
  };

  const currentTheme = colorMap[color] || colorMap.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`p-5 rounded-2xl border ${currentTheme.bg} flex items-center justify-between shadow-xl backdrop-blur-sm transition-all`}
    >
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
      </div>
      <div className={`p-3.5 rounded-xl ${currentTheme.iconBg}`}>
        <Icon size={24} />
      </div>
    </motion.div>
  );
}
