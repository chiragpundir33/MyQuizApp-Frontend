import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Trash2, Plus, RefreshCw, Layers } from 'lucide-react';
import { questionAPI } from '../services/api';

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [o1, setO1] = useState('');
  const [o2, setO2] = useState('');
  const [o3, setO3] = useState('');
  const [o4, setO4] = useState('');
  const [rightAns, setRightAns] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionAPI.getAll();
      setQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions list.');
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

    if (!title || !o1 || !o2 || !rightAns) {
      setError('Please fill in question title, at least 2 options, and the right answer.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        questionTitle: title,
        option1: o1,
        option2: o2,
        option3: o3 || null,
        option4: o4 || null,
        rightAnswer: rightAns,
        difficultyLevel: difficulty,
        category: category || 'General',
      };

      await questionAPI.save(payload);
      setSuccess('Question saved successfully!');
      
      // Reset form
      setTitle('');
      setO1('');
      setO2('');
      setO3('');
      setO4('');
      setRightAns('');
      setDifficulty('Easy');
      setCategory('');

      // Refresh list
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setError('');
    try {
      await questionAPI.delete(id);
      setSuccess('Question deleted.');
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question. It might be referenced in active quizzes.');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Manage Questions</h1>
        <p className="text-slate-400 text-sm mt-1">Admin Panel: Create, update, or remove quiz questions.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Add Question Form (Left column - span 2) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit space-y-6"
        >
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Plus size={18} className="text-purple-400" />
            Add New Question
          </h3>

          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question Title</label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is the capital of France?"
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm h-20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 1</label>
                <input
                  type="text"
                  value={o1}
                  onChange={(e) => setO1(e.target.value)}
                  placeholder="Paris"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 2</label>
                <input
                  type="text"
                  value={o2}
                  onChange={(e) => setO2(e.target.value)}
                  placeholder="London"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 3</label>
                <input
                  type="text"
                  value={o3}
                  onChange={(e) => setO3(e.target.value)}
                  placeholder="Berlin (Optional)"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 4</label>
                <input
                  type="text"
                  value={o4}
                  onChange={(e) => setO4(e.target.value)}
                  placeholder="Rome (Optional)"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Correct Answer</label>
              <input
                type="text"
                value={rightAns}
                onChange={(e) => setRightAns(e.target.value)}
                placeholder="Paris (Must exactly match one option)"
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Geography"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Question'}
            </button>
          </form>
        </motion.div>

        {/* Questions List (Right column - span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers size={18} className="text-purple-400" />
              Existing Questions ({questions.length})
            </h3>
            <button 
              onClick={fetchQuestions}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
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
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        {q.difficultyLevel}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-slate-200 pr-8 leading-snug">
                      {q.questionTitle}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                      <div>Option 1: <span className="text-slate-400 font-semibold">{q.option1}</span></div>
                      <div>Option 2: <span className="text-slate-400 font-semibold">{q.option2}</span></div>
                      {q.option3 && <div>Option 3: <span className="text-slate-400 font-semibold">{q.option3}</span></div>}
                      {q.option4 && <div>Option 4: <span className="text-slate-400 font-semibold">{q.option4}</span></div>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-sm">
                No questions exist yet. Use the form to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
