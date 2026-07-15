import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { quizAPI } from '../services/api';

export default function PlayQuiz() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionText }
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch attempt details and questions
  useEffect(() => {
    const startQuizFlow = async () => {
      try {
        setLoading(true);
        // 1. Get UserQuiz by ID to retrieve the Quiz ID
        const attempt = await quizAPI.getUserQuizById(attemptId);
        setAttemptDetails(attempt);

        // 2. Get questions for the quiz
        const quizQuestions = await quizAPI.getQuestions(attempt.quizSid);
        setQuestions(quizQuestions || []);
      } catch (err) {
        console.error('Error starting quiz play:', err);
        setError('Failed to load quiz details. Verify the backend connection.');
      } finally {
        setLoading(false);
      }
    };

    startQuizFlow();
  }, [attemptId]);

  // Timer countdown logic
  useEffect(() => {
    if (loading || questions.length === 0 || submitting) return;

    setTimeLeft(30); // Reset timer for new question

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextQuestion(); // Auto-progress on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, loading, questions]);

  const handleSelectOption = (optionText) => {
    const currentQuestion = questions[currentIdx];
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionText,
    });
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      submitQuizResults();
    }
  };

  const submitQuizResults = async () => {
    setSubmitting(true);
    try {
      // Form submission body: list of { questionId, selectedAnswer }
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[q.id] || '', // Fallback empty if skipped/timed out
      }));

      const result = await quizAPI.submitQuiz(attemptId, answersPayload);
      
      // Navigate to Review page passing result info
      navigate(`/quiz-review/${attemptId}`, { state: { result } });
    } catch (err) {
      console.error('Failed submitting quiz:', err);
      setError('An error occurred while submitting your answers.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading quiz questions...</span>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <h3 className="text-xl font-bold text-red-400">Unable to Start Quiz</h3>
        <p className="text-slate-400 text-sm">{error || 'This quiz does not contain any questions yet.'}</p>
        <button 
          onClick={() => navigate('/quizzes')}
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl hover:bg-slate-800"
        >
          Return to Quiz List
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const selectedOption = selectedAnswers[currentQuestion.id];
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  const options = [
    currentQuestion.option1,
    currentQuestion.option2,
    currentQuestion.option3,
    currentQuestion.option4,
  ].filter(Boolean); // Clean any nulls

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <div className="w-48 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="bg-purple-600 h-full rounded-full"
            />
          </div>
        </div>

        {/* Timer Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-md transition-colors ${
          timeLeft < 10 
            ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <Timer size={18} />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Question Card with slide transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
            {currentQuestion.questionTitle}
          </h2>

          {/* Options list */}
          <div className="grid grid-cols-1 gap-4">
            {options.map((option, idx) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 rounded-2xl border text-left text-sm sm:text-base font-semibold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25 transform scale-[1.01]'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <CheckCircle2 size={20} />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action Footer */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNextQuestion}
          disabled={submitting}
          className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
        >
          {submitting ? (
            <>
              Submitting...
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : currentIdx < questions.length - 1 ? (
            <>
              Next Question
              <ChevronRight size={16} />
            </>
          ) : (
            <>
              Submit Quiz
              <CheckCircle2 size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
