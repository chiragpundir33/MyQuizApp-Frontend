import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizList from './pages/QuizList';
import AdminQuizzes from './pages/AdminQuizzes';
import PlayQuiz from './pages/PlayQuiz';
import QuizReview from './pages/QuizReview';
import Leaderboard from './pages/Leaderboard';
import AdminQuestions from './pages/AdminQuestions';
import AdminUsers from './pages/AdminUsers';
import AdminQuizDetails from './pages/AdminQuizDetails';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Verifying secure session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Automatic redirect for Admin trying to access regular dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Dashboard />;
};

// Layout Wrapper for Admin views
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative">
      {/* Sidebar for Admin Console */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Mobile Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/quizzes" element={<AdminQuizzes />} />
          <Route path="/questions" element={<AdminQuestions />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/quiz-details" element={<AdminQuizDetails />} />
          {/* Fallback to admin dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Layout Wrapper for authenticated user views
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Hide sidebar on interactive PlayQuiz screen to enable Focus Mode
  const isPlayScreen = location.pathname.includes('/play-quiz/');

  if (isPlayScreen) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-8">
        <main className="w-full flex-1">
          <Routes>
            <Route path="/play-quiz/:attemptId" element={<PlayQuiz />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative">
      {/* Sidebar for Desktop */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Mobile Navbar Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quiz-review/:attemptId" element={<QuizReview />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
