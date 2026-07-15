import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  HelpCircle, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { questionAPI } from '../services/api';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [questionTitle, setQuestionTitle] = useState('');
  const [o1, setO1] = useState('');
  const [o2, setO2] = useState('');
  const [o3, setO3] = useState('');
  const [o4, setO4] = useState('');
  
  // Track which option index is correct (1, 2, 3, or 4)
  const [correctOptionIdx, setCorrectOptionIdx] = useState(1);
  
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionAPI.getAll();
      setQuestions(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch questions catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!questionTitle.trim() || !o1.trim() || !o2.trim()) {
      setError('Question Title and at least Option 1 & Option 2 are required.');
      return;
    }

    // Determine correct answer text based on radio selection
    let rightAnswerText = '';
    if (correctOptionIdx === 1) rightAnswerText = o1;
    else if (correctOptionIdx === 2) rightAnswerText = o2;
    else if (correctOptionIdx === 3) rightAnswerText = o3;
    else if (correctOptionIdx === 4) rightAnswerText = o4;

    if (!rightAnswerText.trim()) {
      setError('The selected correct option text cannot be empty.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        questionTitle: questionTitle,
        option1: o1,
        option2: o2,
        option3: o3 || null,
        option4: o4 || null,
        rightAnswer: rightAnswerText,
        difficultyLevel: difficulty,
        category: category || 'General',
      };

      await questionAPI.save(payload);
      setSuccess('Question created successfully!');
      
      // Reset form
      setQuestionTitle('');
      setO1('');
      setO2('');
      setO3('');
      setO4('');
      setCorrectOptionIdx(1);
      setDifficulty('Easy');
      setCategory('');

      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError('Failed to save question.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setError('');
    setSuccess('');
    try {
      await questionAPI.delete(id);
      setSuccess('Question deleted.');
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError('Failed to delete question. It might be associated with a quiz.');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Questions Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">
          Create, edit, or remove questions. Select the correct answer using the radio controls.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Create Question Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 h-fit"
        >
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Plus size={18} className="text-indigo-400" />
            Add Question
          </h3>

          <form onSubmit={handleAddQuestion} className="space-y-5">
            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question Title</label>
              <textarea
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder="Type your question statement here..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-sm h-24 resize-none"
                required
              />
            </div>

            {/* Options Entry + Radio Correct Indicators */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Options & Correct Selection</label>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <AlertCircle size={10} /> Select one correct option
                </span>
              </div>

              <div className="space-y-3">
                {/* Option 1 */}
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="correct-option"
                    checked={correctOptionIdx === 1}
                    onChange={() => setCorrectOptionIdx(1)}
                    className="w-4 h-4 text-indigo-650 accent-indigo-500 shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={o1}
                    onChange={(e) => setO1(e.target.value)}
                    placeholder="Option 1 text..."
                    className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>

                {/* Option 2 */}
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="correct-option"
                    checked={correctOptionIdx === 2}
                    onChange={() => setCorrectOptionIdx(2)}
                    className="w-4 h-4 text-indigo-650 accent-indigo-500 shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={o2}
                    onChange={(e) => setO2(e.target.value)}
                    placeholder="Option 2 text..."
                    className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>

                {/* Option 3 */}
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="correct-option"
                    checked={correctOptionIdx === 3}
                    onChange={() => setCorrectOptionIdx(3)}
                    className="w-4 h-4 text-indigo-650 accent-indigo-500 shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={o3}
                    onChange={(e) => setO3(e.target.value)}
                    placeholder="Option 3 text..."
                    className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                {/* Option 4 */}
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="correct-option"
                    checked={correctOptionIdx === 4}
                    onChange={() => setCorrectOptionIdx(4)}
                    className="w-4 h-4 text-indigo-650 accent-indigo-500 shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={o4}
                    onChange={(e) => setO4(e.target.value)}
                    placeholder="Option 4 text..."
                    className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Category / Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Java / REST APIs"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Save Question'}
            </button>
          </form>
        </motion.div>

        {/* Existing Questions Pool */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              Existing Questions ({questions.length})
            </h3>
            <button 
              onClick={fetchQuestions}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : questions.length > 0 ? (
              questions.map((q) => (
                <div 
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition-colors relative group"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-red-950/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[9px] font-bold uppercase tracking-wider">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                        {q.difficultyLevel}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">ID: {q.id}</span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-slate-200 pr-8 leading-snug">
                      {q.questionTitle}
                    </h4>

                    {/* Options list showing check mark on correct option */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-800/50 mt-2">
                      {[q.option1, q.option2, q.option3, q.option4].filter(Boolean).map((option, idx) => {
                        const isCorrect = q.rightAnswer && option.toLowerCase() === q.rightAnswer.toLowerCase();
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              isCorrect 
                                ? 'bg-emerald-500/5 border border-emerald-500/25 text-emerald-400 font-medium' 
                                : 'text-slate-500'
                            }`}
                          >
                            {isCorrect ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />}
                            <span className="truncate">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-sm">
                No questions exist yet. Type your statement on the left to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
