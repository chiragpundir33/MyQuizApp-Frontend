import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  History, 
  TrendingUp, 
  BarChart, 
  Activity, 
  ChevronRight,
  BookOpen,
  Bell,
  BellOff,
  Check,
  Clock,
  Play
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { quizAPI, notificationAPI, assignmentAPI } from '../services/api';
import StatCard from '../components/StatCard';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [highestScore, setHighestScore] = useState(0);
  const [leaderboardRank, setLeaderboardRank] = useState('-');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [startingQuizId, setStartingQuizId] = useState(null);

  const fetchNotificationsAndAssignments = async () => {
    if (!user?.id) return;
    try {
      setLoadingNotifications(true);
      setLoadingAssignments(true);
      
      const notifs = await notificationAPI.getNotifications(user.id);
      setNotifications(notifs || []);
      
      const unread = await notificationAPI.getUnreadCount(user.id);
      setUnreadCount(unread || 0);

      const assigns = await assignmentAPI.getUserAssignments(user.id);
      setAssignments(assigns || []);
    } catch (err) {
      console.error('Error fetching notifications/assignments:', err);
    } finally {
      setLoadingNotifications(false);
      setLoadingAssignments(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationAPI.markAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifs.map(n => notificationAPI.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleStartAssignedQuiz = async (assignment) => {
    if (!user?.id) return;
    try {
      setStartingQuizId(assignment.quizId);
      const attempt = await quizAPI.startQuiz(user.id, assignment.quizId);
      if (attempt && attempt.id) {
        navigate(`/play-quiz/${attempt.id}`);
      } else {
        alert('Failed to start quiz attempt.');
      }
    } catch (err) {
      console.error('Error starting assigned quiz:', err);
      alert('Error initializing quiz attempt.');
    } finally {
      setStartingQuizId(null);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Fetch history
        const userHistory = await quizAPI.getHistory(user.id);
        setHistory(userHistory || []);

        // Fetch highest score
        const hsResponse = await quizAPI.getHighestScore(user.id);
        setHighestScore(hsResponse?.highestScore || 0);

        // Fetch leaderboard to determine rank
        const lbData = await quizAPI.getLeaderboard();
        const userRank = lbData.find(item => item.username === user.name)?.rank;
        setLeaderboardRank(userRank ? `#${userRank}` : 'Unranked');
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchNotificationsAndAssignments();
  }, [user]);

  // Compute summary stats
  const totalQuizzes = history.length;
  const avgScore = totalQuizzes > 0
    ? (history.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalQuizzes).toFixed(1)
    : 0;

  // Prepare chart data: chronological order (oldest to newest)
  const chartData = [...history]
    .reverse()
    .map((attempt, index) => ({
      name: `Quiz ${index + 1}`,
      Score: attempt.score,
      Quiz: attempt.quizName,
    }));

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-white">Hello, {user?.name}!</h1>
          <p className="text-slate-400 text-sm mt-1">Here is a summary of your performance and quiz history.</p>
        </div>
        <Link 
          to="/quizzes"
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all transform hover:-translate-y-0.5"
        >
          Take a Quiz
          <BookOpen size={16} />
        </Link>
      </motion.div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Attempts" 
          value={loading ? '...' : totalQuizzes} 
          icon={History} 
          color="blue" 
        />
        <StatCard 
          title="Average Score" 
          value={loading ? '...' : `${avgScore} pts`} 
          icon={TrendingUp} 
          color="purple" 
        />
        <StatCard 
          title="Highest Score" 
          value={loading ? '...' : `${highestScore} pts`} 
          icon={Trophy} 
          color="emerald" 
        />
        <StatCard 
          title="Leaderboard Rank" 
          value={loading ? '...' : leaderboardRank} 
          icon={Activity} 
          color="amber" 
        />
      </div>

      {/* Notifications & Assignments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-white">Assigned Quizzes</h3>
                <p className="text-slate-400 text-xs mt-0.5">Quizzes assigned to you by administrators</p>
              </div>
              <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400 border border-indigo-500/20">
                <BookOpen size={18} />
              </div>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {loadingAssignments ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : assignments.filter(a => a.status === 'ASSIGNED').length > 0 ? (
                assignments.filter(a => a.status === 'ASSIGNED').map((assign) => (
                  <div 
                    key={assign.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/30 border border-slate-800 rounded-2xl gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-200">{assign.quizTitle}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-amber-500" />
                          Due: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'No Limit'}
                        </span>
                        <span className="bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded text-[9px] font-bold text-purple-400 uppercase tracking-wider">
                          {assign.status}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartAssignedQuiz(assign)}
                      disabled={startingQuizId !== null}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all self-start sm:self-center shrink-0 disabled:opacity-50"
                    >
                      {startingQuizId === assign.quizId ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Play size={12} fill="currentColor" />
                          Start Quiz
                        </>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500">
                  <Check size={24} className="text-slate-650" />
                  <span className="text-sm font-medium">All caught up!</span>
                  <p className="text-xs text-slate-500 max-w-xs">You have no pending assignments at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications Pane */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {loadingNotifications ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-800/40 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-3 border rounded-xl transition-all relative ${
                      notif.read 
                        ? 'bg-slate-950/20 border-slate-850 text-slate-500' 
                        : 'bg-indigo-950/10 border-indigo-500/20 text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{notif.message}</p>
                        <span className="text-[9px] text-slate-550 block mt-1">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-400 transition-colors shrink-0"
                          title="Mark as read"
                        >
                          <Check size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-center text-slate-500">
                  <BellOff size={20} className="text-slate-500" />
                  <span className="text-xs font-medium">No notifications</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Score Progress</h3>
              <p className="text-slate-400 text-xs mt-0.5">Chronological record of recent scores</p>
            </div>
            <div className="bg-slate-800 p-2 rounded-xl text-slate-400">
              <BarChart size={18} />
            </div>
          </div>

          <div className="h-[300px] w-full text-slate-400 text-sm">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                    labelClassName="text-slate-400 font-bold"
                  />
                  <Area type="monotone" dataKey="Score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
                <span className="text-slate-500 font-medium">No quiz attempts yet</span>
                <p className="text-xs text-slate-600 max-w-xs">Complete your first quiz to generate progress analytics.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* History Log Column */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Recent Attempts</h3>
              <p className="text-slate-400 text-xs mt-0.5">Logs of recent answers</p>
            </div>
            <History size={18} className="text-slate-500" />
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : history.length > 0 ? (
              history.slice(0, 5).map((attempt, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3.5 bg-slate-800/30 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 truncate">{attempt.quizName}</h4>
                    <span className="text-xs text-slate-500">
                      {attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-purple-400">
                      {attempt.score}/{attempt.totalQuestions}
                    </span>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Correct</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-12">
                <span className="text-slate-500 text-sm font-medium">History empty</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
