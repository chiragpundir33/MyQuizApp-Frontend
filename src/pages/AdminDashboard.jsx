import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, HelpCircle, Trophy, ArrowRight, ClipboardCheck } from 'lucide-react';
import apiClient from '../services/axiosConfig';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { assignmentAPI } from '../services/api';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [highestScorers, setHighestScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        // Fetch all users
        const usersRes = await apiClient.get('/user/getAllUser');
        setUsers(usersRes.data || []);
        setUserCount((usersRes.data || []).length);

        // Fetch all assignments
        const assignmentsRes = await assignmentAPI.getAllAssignments();
        setAssignments(assignmentsRes || []);

        // Fetch all quizzes
        const quizzesRes = await apiClient.get('/quiz/getAll');
        setQuizCount((quizzesRes.data || []).length);

        // Fetch all questions
        const questionsRes = await apiClient.get('/question/getAll');
        setQuestionCount((questionsRes.data || []).length);

        // Fetch all user details to calculate highest scores
        const detailsRes = await apiClient.get('/quiz/getAllUserDetails');
        const detailsLogs = detailsRes.data || [];

        const topScorers = {};
        detailsLogs.forEach(entry => {
          const sid = entry.quizSid;
          const quizName = entry.quizName;

          if (entry.userQuestionResponseList && entry.userQuestionResponseList.length > 0) {
            entry.userQuestionResponseList.forEach(attempt => {
              const score = parseFloat(attempt.totalMarks) || 0;
              if (!topScorers[sid] || score > topScorers[sid].score) {
                topScorers[sid] = {
                  quizSid: sid,
                  quizName,
                  score,
                  fullName: attempt.fullName || 'Anonymous User',
                  email: attempt.userName || 'No email'
                };
              }
            });
          }
        });

        setHighestScorers(Object.values(topScorers));

      } catch (error) {
        console.error('Error loading admin statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [token]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            System Administration
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global view of application entities and system metrics.
          </p>
        </div>
      </motion.div>

      {/* Stats row */}
      {(() => {
        const totalAssignments = assignments.length;
        const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={loading ? '...' : userCount} 
              icon={Users} 
              color="blue" 
            />
            <StatCard 
              title="Active Quizzes" 
              value={loading ? '...' : quizCount} 
              icon={BookOpen} 
              color="purple" 
            />
            <StatCard 
              title="Questions Pool" 
              value={loading ? '...' : questionCount} 
              icon={HelpCircle} 
              color="emerald" 
            />
            <StatCard 
              title="Assigned Quizzes Done" 
              value={loading ? '...' : `${completedAssignments} / ${totalAssignments}`} 
              icon={ClipboardCheck} 
              color="amber" 
            />
          </div>
        );
      })()}

      {/* Control panel & summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
        >
          <h3 className="font-bold text-lg text-white">System Controls</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Administrative pathways to edit quiz databases, map question sets, and toggle user profiles.
          </p>

          <div className="space-y-3 pt-2">
            <Link 
              to="/admin/quizzes" 
              className="w-full flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-indigo-950/20 hover:border-indigo-500/25 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-semibold text-slate-200">Manage Quizzes</span>
              </div>
              <ArrowRight size={16} className="text-slate-655 group-hover:text-indigo-400 transition-colors" />
            </Link>

            <Link 
              to="/admin/questions" 
              className="w-full flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-indigo-950/20 hover:border-indigo-500/25 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <HelpCircle size={16} />
                </div>
                <span className="text-sm font-semibold text-slate-200">Questions Catalog</span>
              </div>
              <ArrowRight size={16} className="text-slate-655 group-hover:text-indigo-400 transition-colors" />
            </Link>

            <Link 
              to="/admin/users" 
              className="w-full flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-indigo-950/20 hover:border-indigo-500/25 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Users size={16} />
                </div>
                <span className="text-sm font-semibold text-slate-200">User Management</span>
              </div>
              <ArrowRight size={16} className="text-slate-655 group-hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
        </motion.div>

        {/* Highest Scorers list replacing System Security */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4 flex-1">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Quiz Top Scorers
            </h3>
            <p className="text-slate-400 text-xs">
              Highest scoring user for each active quiz topic.
            </p>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-premium">
              {loading ? (
                [1, 2].map(i => (
                  <div key={i} className="h-12 bg-slate-950/40 rounded-xl animate-pulse" />
                ))
              ) : highestScorers.length > 0 ? (
                highestScorers.map((scorer, idx) => (
                  <div key={scorer.quizSid || idx} className="p-3 bg-slate-955/50 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs">
                    <div className="space-y-0.5 truncate pr-3">
                      <span className="font-bold text-slate-300 block truncate">{scorer.quizName}</span>
                      <span className="text-[10px] text-slate-500">{scorer.fullName} ({scorer.email})</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded-lg text-yellow-450 font-extrabold">
                      <Trophy size={11} />
                      <span>{scorer.score}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-600 text-xs">
                  No performance records recorded yet.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quiz Assignments Tracker Log */}
      {(() => {
        const totalAssignments = assignments.length;
        const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length;
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-white">Quiz Assignments Tracker</h3>
                <p className="text-slate-400 text-xs mt-0.5">Audit log of assigned quiz topics and their completion status.</p>
              </div>
              <span className="bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 rounded-xl text-indigo-400 text-xs font-bold self-start sm:self-center">
                {completedAssignments} of {totalAssignments} Done
              </span>
            </div>

            <div className="overflow-x-auto pr-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Quiz Topic</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {loading ? (
                    [1, 2].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4"><div className="h-4 bg-slate-850 rounded w-20" /></td>
                        <td className="p-4"><div className="h-4 bg-slate-850 rounded w-32" /></td>
                        <td className="p-4"><div className="h-4 bg-slate-850 rounded w-28" /></td>
                        <td className="p-4"><div className="h-4 bg-slate-850 rounded w-20" /></td>
                        <td className="p-4"><div className="h-4 bg-slate-850 rounded w-16" /></td>
                      </tr>
                    ))
                  ) : assignments.length > 0 ? (
                    assignments.map((assignment) => {
                      const assignedUser = users.find(u => u.id === assignment.userId);
                      return (
                        <tr key={assignment.id} className="hover:bg-slate-850/10 transition-colors">
                          <td className="p-4 font-bold text-slate-200">
                            {assignedUser ? assignedUser.name : `User #${assignment.userId}`}
                          </td>
                          <td className="p-4 text-slate-400">
                            {assignedUser ? assignedUser.email : 'N/A'}
                          </td>
                          <td className="p-4 text-slate-200">
                            {assignment.quizTitle || `Quiz #${assignment.quizId}`}
                          </td>
                          <td className="p-4 text-slate-400">
                            {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Limit'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                              assignment.status === 'COMPLETED' 
                                ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-450' 
                                : assignment.status === 'EXPIRED'
                                ? 'bg-red-500/10 border border-red-500/25 text-red-450'
                                : 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400'
                            }`}>
                              {assignment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">
                        No assignment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
