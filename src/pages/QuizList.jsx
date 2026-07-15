import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, ArrowRight, Activity, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';

export default function QuizList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingQuizId, setStartingQuizId] = useState(null);
  const [error, setError] = useState('');

  const fetchQuizzesAndHistory = async () => {
    try {
      setLoading(true);
      const quizzesData = await quizAPI.getAll();
      setQuizzes(quizzesData || []);

      if (user?.id) {
        const historyData = await quizAPI.getHistory(user.id);
        setHistory(historyData || []);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Could not load quizzes. Verify the backend service status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesAndHistory();
  }, [user]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Available Quizzes</h1>
        <p className="text-slate-400 text-sm mt-1">Select a challenge below and test your knowledge.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => {
            const quizId = quiz.id || index + 1;
            const isStarting = startingQuizId === quizId;

            // Check if user has already completed this quiz by matching titles
            const hasCompleted = history.some(attempt => attempt.quizName === quiz.title);

            const handleStart = async () => {
              if (!user?.id) {
                setError('You must be logged in to take a quiz.');
                return;
              }
              try {
                setStartingQuizId(quizId);
                setError('');
                // Initialize the UserQuiz attempt
                const attempt = await quizAPI.startQuiz(user.id, quizId);
                // Navigate to play screen
                navigate(`/play-quiz/${attempt.id}`);
              } catch (err) {
                console.error('Failed to start quiz:', err);
                setError('Failed to start quiz. Check if database connection is open.');
                setStartingQuizId(null);
              }
            };

            return (
              <motion.div
                key={quizId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-purple-500/50 shadow-xl transition-all flex flex-col justify-between relative group"
              >
                {/* Completed status indicator */}
                {hasCompleted && (
                  <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-xl flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
                    <CheckCircle2 size={12} className="shrink-0" />
                    <span>Completed</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400">
                      <BookOpen size={20} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Quiz Topic</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 line-clamp-2 leading-snug pr-20">{quiz.title}</h3>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Calendar size={14} />
                    <span>No Timer Limit</span>
                  </div>
                  
                  <button
                    onClick={handleStart}
                    disabled={isStarting}
                    className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 ${
                      hasCompleted 
                        ? 'bg-slate-800 hover:bg-slate-750 hover:text-white shadow-slate-950/20' 
                        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/10'
                    }`}
                  >
                    {isStarting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {hasCompleted ? 'Retake Challenge' : 'Start Challenge'}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 rounded-3xl gap-4">
          <BookOpen size={48} className="text-slate-700 animate-bounce" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-300">No quizzes available</h3>
            <p className="text-sm text-slate-500 max-w-sm">Ask an administrator to create a quiz via the backend API.</p>
          </div>
        </div>
      )}
    </div>
  );
}
