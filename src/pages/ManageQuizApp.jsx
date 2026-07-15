import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  CheckSquare, 
  Square,
  Settings,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { quizAPI, questionAPI } from '../services/api';

export default function ManageQuizApp() {
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'questions'
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Loading states
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Quiz Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Add Question Form State
  const [qTitle, setQTitle] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [rightAnswer, setRightAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('');

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const data = await quizAPI.getAll();
      setQuizzes(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quizzes.');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const data = await questionAPI.getAll();
      setQuestions(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch questions pool.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchQuestions();
  }, []);

  const handleToggleQuestionSelection = (id) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(qId => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  // Add Quiz Handler
  const handleAddQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!quizTitle.trim()) {
      setError('Quiz title is required.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: quizTitle,
        questionIds: selectedQuestionIds,
      };
      await quizAPI.saveQuiz(payload);
      setSuccess('Quiz created successfully!');
      setQuizTitle('');
      setSelectedQuestionIds([]);
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      setError('Failed to create quiz.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Quiz Handler
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    setError('');
    setSuccess('');
    try {
      await quizAPI.deleteQuiz(id);
      setSuccess('Quiz deleted successfully.');
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      setError('Failed to delete quiz. It might have referenced attempts.');
    }
  };

  // Add Question Handler
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!qTitle || !opt1 || !opt2 || !rightAnswer) {
      setError('Please fill in title, at least 2 options, and correct answer.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        questionTitle: qTitle,
        option1: opt1,
        option2: opt2,
        option3: opt3 || null,
        option4: opt4 || null,
        rightAnswer: rightAnswer,
        difficultyLevel: difficulty,
        category: category || 'General',
      };
      await questionAPI.save(payload);
      setSuccess('Question saved to database!');
      // Reset form
      setQTitle('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setOpt4('');
      setRightAnswer('');
      setDifficulty('Easy');
      setCategory('');
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError('Failed to add question.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Question Handler
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
      setError('Failed to delete question. It might be linked to a quiz.');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Settings className="text-purple-500 animate-spin-slow" />
            Admin Panel Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage quizzes, associate questions, and configure game pools.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'quizzes'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'questions'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle size={16} />
            Questions ({questions.length})
          </button>
        </div>
      </div>

      {/* Message Banner */}
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

      {/* Main Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'quizzes' ? (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* Create Quiz Form (Left - span 2) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FolderPlus size={18} className="text-purple-400" />
                Create New Quiz
              </h3>

              <form onSubmit={handleAddQuiz} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quiz Title</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="E.g., Spring Boot Advanced Concepts"
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-650 focus:outline-none focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                {/* Associate Questions Scroll Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex justify-between">
                    <span>Select Questions</span>
                    <span className="text-purple-400 font-bold">{selectedQuestionIds.length} Selected</span>
                  </label>

                  <div className="border border-slate-800 rounded-2xl bg-slate-950 p-3 h-56 overflow-y-auto space-y-2">
                    {questions.length > 0 ? (
                      questions.map(q => {
                        const isChecked = selectedQuestionIds.includes(q.id);
                        return (
                          <div 
                            key={q.id}
                            onClick={() => handleToggleQuestionSelection(q.id)}
                            className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors"
                          >
                            <div className="text-purple-500">
                              {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-200 truncate">{q.questionTitle}</p>
                              <span className="text-[9px] uppercase font-bold text-slate-500">{q.category} • {q.difficultyLevel}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-xs text-slate-600">
                        Create questions first to link them to quizzes.
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Save Quiz'}
                </button>
              </form>
            </div>

            {/* Quizzes List (Right - span 3) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layers size={18} className="text-purple-400" />
                  Active Quizzes Pool ({quizzes.length})
                </h3>
                <button 
                  onClick={fetchQuizzes}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {loadingQuizzes ? (
                  <div className="h-28 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
                ) : quizzes.length > 0 ? (
                  quizzes.map((quiz, idx) => {
                    const id = quiz.id || idx + 1;
                    return (
                      <div 
                        key={id}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors group"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-200 text-base">{quiz.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                              ID: {id}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuiz(id)}
                          className="p-2 rounded-xl bg-red-950/20 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-sm">
                    No quizzes found. Write a title on the left to create one.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* Create Question Form (Left - span 2) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 h-fit">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Plus size={18} className="text-purple-400" />
                Add New Question
              </h3>

              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question Title</label>
                  <textarea
                    value={qTitle}
                    onChange={(e) => setQTitle(e.target.value)}
                    placeholder="Enter the question description..."
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-650 focus:outline-none focus:border-purple-500 text-sm h-20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 1</label>
                    <input
                      type="text"
                      value={opt1}
                      onChange={(e) => setOpt1(e.target.value)}
                      placeholder="Paris"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 2</label>
                    <input
                      type="text"
                      value={opt2}
                      onChange={(e) => setOpt2(e.target.value)}
                      placeholder="London"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 3</label>
                    <input
                      type="text"
                      value={opt3}
                      onChange={(e) => setOpt3(e.target.value)}
                      placeholder="Berlin"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Option 4</label>
                    <input
                      type="text"
                      value={opt4}
                      onChange={(e) => setOpt4(e.target.value)}
                      placeholder="Rome"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Correct Answer</label>
                  <input
                    type="text"
                    value={rightAnswer}
                    onChange={(e) => setRightAnswer(e.target.value)}
                    placeholder="Must exactly match one option"
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-650 focus:outline-none focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
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
                      placeholder="History"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Save Question'}
                </button>
              </form>
            </div>

            {/* Questions List (Right - span 3) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layers size={18} className="text-purple-400" />
                  Questions Database ({questions.length})
                </h3>
                <button 
                  onClick={fetchQuestions}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {loadingQuestions ? (
                  <div className="h-28 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
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

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-wider">
                            {q.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                            {q.difficultyLevel}
                          </span>
                          <span className="text-[10px] text-slate-500">ID: {q.id}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 pr-8 leading-snug">
                          {q.questionTitle}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                          <div>Option 1: <span className="text-slate-400">{q.option1}</span></div>
                          <div>Option 2: <span className="text-slate-400">{q.option2}</span></div>
                          {q.option3 && <div>Option 3: <span className="text-slate-400">{q.option3}</span></div>}
                          {q.option4 && <div>Option 4: <span className="text-slate-400">{q.option4}</span></div>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-sm">
                    No questions exist yet. Use the form to write one.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
