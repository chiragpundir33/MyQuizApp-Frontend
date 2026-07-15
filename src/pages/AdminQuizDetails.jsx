import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  User, 
  Mail, 
  Award, 
  HelpCircle, 
  Eye, 
  ChevronRight, 
  X, 
  CheckCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminQuizDetails() {
  const { token } = useAuth();
  const [quizDetails, setQuizDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Details state
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:8081/quiz/getAllUserDetails', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const backendLogs = res.data || [];

      // Group attempts by quizSid to ensure each quiz appears exactly once
      const groupedMap = {};
      backendLogs.forEach(entry => {
        const sid = entry.quizSid;
        if (!groupedMap[sid]) {
          groupedMap[sid] = {
            quizSid: sid,
            quizName: entry.quizName,
            userQuestionResponseList: []
          };
        }
        if (entry.userQuestionResponseList && entry.userQuestionResponseList.length > 0) {
          groupedMap[sid].userQuestionResponseList.push(...entry.userQuestionResponseList);
        }
      });

      // Format logs and sort users by total marks (descending)
      const aggregatedQuizzes = Object.values(groupedMap).map(quiz => {
        const sortedAttempts = [...quiz.userQuestionResponseList].sort((a, b) => {
          const scoreA = parseFloat(a.totalMarks) || 0;
          const scoreB = parseFloat(b.totalMarks) || 0;
          return scoreB - scoreA; // highest score first
        });

        return {
          ...quiz,
          userQuestionResponseList: sortedAttempts
        };
      });

      setQuizDetails(aggregatedQuizzes);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch detailed quiz audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
  }, [token]);

  const filteredQuizzes = quizDetails.filter(q => 
    q.quizName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ClipboardList className="text-indigo-400" />
            Quiz Detail Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track user performance metrics, score distributions, and review correct answers by quiz topic.
          </p>
        </div>
        <button 
          onClick={fetchQuizDetails}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-450 hover:text-white flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 max-w-md">
        <Search size={18} className="text-slate-500 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter logs by quiz name..."
          className="bg-transparent border-none text-white text-sm focus:outline-none placeholder-slate-650 w-full"
        />
      </div>

      {/* Quiz List Logs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, idx) => {
            const attemptCount = quiz.userQuestionResponseList?.length || 0;
            return (
              <motion.div
                key={quiz.quizSid || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded">
                      ID: #{quiz.quizSid || 'N/A'}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {attemptCount} {attemptCount === 1 ? 'Attempt' : 'Attempts'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-200 line-clamp-2 leading-snug">
                    {quiz.quizName}
                  </h3>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedQuiz(quiz)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye size={14} /> Audit Performance
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-505 text-sm">
          No detailed quiz audit logs found.
        </div>
      )}

      {/* Main Attempts Modal */}
      <AnimatePresence>
        {selectedQuiz && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              {/* Close button */}
              <button 
                onClick={() => setSelectedQuiz(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>

              <div className="border-b border-slate-800 pb-4 pr-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-455">Performance Log Audit</span>
                <h3 className="font-extrabold text-xl text-white mt-0.5 truncate">{selectedQuiz.quizName}</h3>
              </div>

              {/* Attempts list sorted by marks */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-premium">
                <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">User Attempts ({selectedQuiz.userQuestionResponseList?.length || 0})</h4>
                
                {selectedQuiz.userQuestionResponseList && selectedQuiz.userQuestionResponseList.length > 0 ? (
                  selectedQuiz.userQuestionResponseList.map((attempt, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl relative">
                          <User size={18} />
                          {/* Display rank badge next to icon */}
                          <div className="absolute -top-1.5 -right-1.5 bg-indigo-650 text-white font-extrabold text-[8px] px-1 rounded-full border border-slate-800">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-200 text-sm leading-snug">{attempt.fullName || 'Anonymous User'}</h5>
                          <span className="text-[10px] text-slate-550 flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {attempt.userName || 'No email address'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Score</span>
                          <span className="text-sm font-extrabold text-indigo-400">{attempt.totalMarks || '0'}</span>
                        </div>
                        <button
                          onClick={() => setSelectedAttempt(attempt)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white transition-colors"
                          title="Audit Questions"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-slate-550">
                    No attempts registered for this quiz.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-colors"
                >
                  Close Audit Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Nested Attempt Questions Breakdown Modal */}
      <AnimatePresence>
        {selectedAttempt && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedAttempt(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>

              <div className="border-b border-slate-800 pb-4 pr-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-450">Question Response Audit</span>
                <h3 className="font-extrabold text-base text-white mt-0.5">Audit: {selectedAttempt.fullName}</h3>
                <span className="text-[10px] text-slate-550 font-semibold">User Email: {selectedAttempt.userName} • Score: {selectedAttempt.totalMarks}</span>
              </div>

              {/* Questions list */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-premium">
                {selectedAttempt.questionResponseList && selectedAttempt.questionResponseList.length > 0 ? (
                  selectedAttempt.questionResponseList.map((q, idx) => (
                    <div 
                      key={q.id || idx}
                      className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-bold text-slate-200 text-sm leading-snug">
                          {idx + 1}. {q.questionTitle}
                        </h5>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[8px] font-extrabold uppercase shrink-0">
                          {q.difficultyLevel}
                        </span>
                      </div>

                      {/* Displaying options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        {[q.option1, q.option2, q.option3, q.option4].filter(Boolean).map((opt, idx) => {
                          const optionLetters = ['A', 'B', 'C', 'D'];
                          const isCorrect = q.correctAnswer?.toLowerCase() === opt.toLowerCase();
                          const isSelected = q.selectedAnswer?.toLowerCase() === opt.toLowerCase();

                          let borderStyle = 'border border-slate-800/80 bg-slate-950/20 text-slate-400';
                          if (isSelected && isCorrect) {
                            borderStyle = 'border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            borderStyle = 'border border-red-500/40 bg-red-950/20 text-red-400 font-semibold';
                          } else if (isCorrect) {
                            borderStyle = 'border border-emerald-500/25 bg-emerald-950/5 text-emerald-450/80';
                          }

                          return (
                            <div key={idx} className={`p-3 rounded-xl flex items-center justify-between transition-colors ${borderStyle}`}>
                              <div>
                                <span className="font-bold mr-1.5">{optionLetters[idx]}.</span>
                                <span>{opt}</span>
                              </div>
                              {isSelected && (
                                <span className="text-[9px] font-extrabold uppercase bg-slate-900 px-1.5 py-0.5 rounded tracking-wider text-current">
                                  Selected
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2.5 border-t border-slate-800/40 flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-slate-500">
                        <span>Selected Answer: <strong className={q.correctAnswer?.toLowerCase() === q.selectedAnswer?.toLowerCase() ? 'text-emerald-400' : 'text-red-400'}>{q.selectedAnswer || 'Not Answered'}</strong></span>
                        <span>Correct Answer: <strong className="text-emerald-400">{q.correctAnswer}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-slate-550">
                    No questions recorded for this attempt.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-colors"
                >
                  Back to Attempts
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
