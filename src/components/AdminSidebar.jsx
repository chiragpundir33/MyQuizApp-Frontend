import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield,
  LayoutGrid, 
  Layers, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Sliders,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutGrid },
    { name: 'Manage Quizzes', path: '/admin/quizzes', icon: Layers },
    { name: 'Questions Catalog', path: '/admin/questions', icon: HelpCircle },
    { name: 'User Management', path: '/admin/users', icon: User },
    { name: 'Quiz Logs', path: '/admin/quiz-details', icon: ClipboardList },
  ];

  return (
    <motion.aside
      animate={{ width: isOpen ? 260 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col bg-slate-900 border-r border-indigo-950/40 text-slate-300 h-screen sticky top-0 z-20 shrink-0 overflow-x-hidden"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-indigo-950/40 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <Shield size={20} className="animate-pulse" />
          </div>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-sm tracking-wider text-indigo-400 uppercase truncate"
            >
              Control Center
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

      {/* User profile */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mx-3 my-4 bg-indigo-950/20 border border-indigo-500/10 rounded-xl flex items-center gap-3 overflow-hidden"
        >
          <div className="bg-indigo-900/40 p-2.5 rounded-full border border-indigo-500/20 text-indigo-400">
            <User size={20} />
          </div>
          <div className="truncate">
            <h4 className="font-semibold text-sm text-slate-100 truncate">{user?.name}</h4>
            <span className="text-xs text-indigo-400 uppercase font-semibold tracking-wider flex items-center gap-1">
              <Sliders size={12} />
              SYSTEM ADMIN
            </span>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3.5 py-3 rounded-lg font-medium transition-all group duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
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

      {/* Sign Out */}
      <div className="p-3 border-t border-indigo-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-3.5 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all font-medium"
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="text-sm">Log Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
