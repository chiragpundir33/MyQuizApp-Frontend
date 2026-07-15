import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, User } from 'lucide-react';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await quizAPI.getLeaderboard();
        setLeaderboard(data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to retrieve leaderboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl border border-amber-500/30 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <Trophy size={14} className="fill-amber-400" />
            <span>1st Place</span>
          </div>
        );
      case 2:
        return (
          <div className="bg-slate-300/20 text-slate-300 p-2 rounded-xl border border-slate-300/30 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <Medal size={14} className="fill-slate-300" />
            <span>2nd Place</span>
          </div>
        );
      case 3:
        return (
          <div className="bg-amber-700/20 text-amber-600 p-2 rounded-xl border border-amber-700/30 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <Medal size={14} className="fill-amber-600" />
            <span>3rd Place</span>
          </div>
        );
      default:
        return (
          <div className="bg-slate-800 text-slate-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Global Leaderboard</h1>
        <p className="text-slate-400 text-sm mt-1">See how you measure up against other top quiz takers globally.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-5">Rank</th>
                <th className="p-5">User</th>
                <th className="p-5 text-right">Highest Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-16" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-32" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : leaderboard.length > 0 ? (
                leaderboard.map((item) => {
                  const isCurrentUser = item.username === user?.name;
                  return (
                    <tr 
                      key={item.rank} 
                      className={`transition-colors hover:bg-slate-850/40 ${
                        isCurrentUser ? 'bg-purple-600/5' : ''
                      }`}
                    >
                      <td className="p-5 font-semibold text-slate-300">
                        {getRankBadge(item.rank)}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            isCurrentUser 
                              ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            <User size={16} />
                          </div>
                          <div>
                            <span className={`font-bold ${isCurrentUser ? 'text-purple-400' : 'text-slate-200'}`}>
                              {item.username}
                            </span>
                            {isCurrentUser && (
                              <span className="ml-2 text-[10px] bg-purple-600/20 border border-purple-500/30 px-1.5 py-0.5 rounded-md uppercase font-bold text-purple-300">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-right font-extrabold text-slate-100">
                        <div className="flex items-center justify-end gap-1.5 text-purple-400">
                          <Star size={14} className="fill-purple-400" />
                          <span>{item.highestScore} pts</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-slate-500 text-sm">
                    Leaderboard is empty. Be the first to take a quiz!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
