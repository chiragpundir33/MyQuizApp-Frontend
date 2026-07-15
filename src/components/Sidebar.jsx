import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  HelpCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Quizzes', path: '/quizzes', icon: BookOpen },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ name: 'Admin Panel', path: '/admin-panel', icon: HelpCircle });
  }

  return (
    <motion.aside
      animate={{ width: isOpen ? 260 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 z-20 shrink-0 overflow-x-hidden"
    >
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-purple-600 p-2 rounded-lg text-white">
            <Trophy size={20} className="animate-pulse" />
          </div>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg text-white tracking-wider truncate"
            >
              QuizPortal
            </motion.span>
          )}
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* User Info Card */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mx-3 my-4 bg-slate-800/50 border border-slate-800 rounded-xl flex items-center gap-3 overflow-hidden"
        >
          <div className="bg-purple-900/50 p-2.5 rounded-full border border-purple-500/20 text-purple-400">
            <User size={20} />
          </div>
          <div className="truncate">
            <h4 className="font-semibold text-sm text-slate-100 truncate">{user?.name}</h4>
            <span className="text-xs text-purple-400 uppercase font-semibold tracking-wider">{user?.role}</span>
          </div>
        </motion.div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3.5 py-3 rounded-lg font-medium transition-all group duration-200 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm truncate"
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer Button */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-3.5 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all font-medium"
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
