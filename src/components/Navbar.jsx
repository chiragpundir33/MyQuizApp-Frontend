import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Trophy, LogOut, LayoutDashboard, BookOpen, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Quizzes', path: '/quizzes', icon: BookOpen },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ name: 'Admin Panel', path: '/admin-panel', icon: HelpCircle });
  }

  return (
    <header className="md:hidden bg-slate-900 border-b border-slate-800 text-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="bg-purple-600 p-1.5 rounded-lg text-white">
          <Trophy size={18} />
        </div>
        <span className="font-bold text-white tracking-wider">QuizPortal</span>
      </div>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 shadow-xl py-4 px-4 flex flex-col gap-3 transition-transform duration-300">
          <div className="flex items-center gap-3 py-2 px-1 border-b border-slate-800">
            <div className="bg-purple-900/50 p-2 rounded-full text-purple-400">
              <User size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-100">{user?.name}</h4>
              <span className="text-xs text-purple-400 uppercase font-semibold">{user?.role}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all font-medium border-t border-slate-800 pt-3"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
