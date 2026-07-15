import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Home, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { quizAPI } from '../services/api';

export default function QuizReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [review, setReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        setLoading(true);
        // Fetch review answers: list of { questionId, questionTitle, selectedAnswer, correctAnswer, isCorrect }
        const reviewData = await quizAPI.reviewQuiz(attemptId);
        setReview(reviewData || []);

        if (!result) {
          // Fallback to fetch result details if user refreshed and history lost state
          // Calculate scores based on the answers retrieved
          const totalQ = reviewData.length;
          const correctQ = reviewData.filter(a => a.isCorrect).length;
          const pct = totalQ > 0 ? (correctQ / totalQ) * 100 : 0;
          setResult({
            totalQuestions: totalQ,
            correctAnswers: correctQ,
            percentage: pct,
            result: pct >= 40 ? 'PASS' : 'FAIL',
          });
        }
      } catch (err) {
        console.error('Error fetching review:', err);
        setError('Failed to fetch review data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [attemptId, result]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Grading and fetching answer audit...</span>
      </div>
    );
  }

  if (error || review.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <h3 className="text-xl font-bold text-red-400">Unable to Load Review</h3>
        <p className="text-slate-400 text-sm">{error || 'No answers found for this attempt.'}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl hover:bg-slate-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isPass = result?.result === 'PASS';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Result Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-8 rounded-3xl border text-center relative overflow-hidden shadow-2xl ${
          isPass 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}
      >
        <div className="relative z-10 space-y-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isPass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {result?.result}
          </span>
          
          <h1 className="text-5xl font-black tracking-tight">
            {result?.percentage.toFixed(0)}%
          </h1>
          
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            You answered <span className="font-bold text-white">{result?.correctAnswers}</span> out of{' '}
            <span className="font-bold text-white">{result?.totalQuestions}</span> questions correctly.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center gap-2 hover:bg-slate-850 transition-colors"
            >
              <Home size={16} />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/quizzes')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/10 transition-colors"
            >
              <BookOpen size={16} />
              Take More Quizzes
            </button>
          </div>
        </div>
      </motion.div>

      {/* Answer Audit Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <AlertCircle size={20} className="text-purple-400" />
          Review Questions
        </h3>

        <div className="space-y-6">
          {review.map((item, index) => (
            <motion.div
              key={item.questionId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <h4 className="font-bold text-base text-slate-200 leading-snug">
                  <span className="text-purple-400 mr-2">Q{index + 1}.</span>
                  {item.questionTitle}
                </h4>
                <div className="shrink-0">
                  {item.isCorrect ? (
                    <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 size={16} />
                      <span>Correct</span>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 p-1.5 rounded-lg text-red-400 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                      <XCircle size={16} />
                      <span>Incorrect</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-4 rounded-xl border text-sm flex flex-col justify-center gap-1 ${
                  item.isCorrect 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Your Answer</span>
                  <span className="font-semibold">{item.selectedAnswer || '(No answer provided)'}</span>
                </div>
                
                {!item.isCorrect && (
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm flex flex-col justify-center gap-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Correct Answer</span>
                    <span className="font-semibold">{item.correctAnswer}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
