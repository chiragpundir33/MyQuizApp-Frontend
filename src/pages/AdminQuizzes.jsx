import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus, 
  Trash2, 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Square,
  RefreshCw,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';
import { quizAPI, questionAPI } from '../services/api';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inline Question Creator state
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qCorrectIdx, setQCorrectIdx] = useState(1);
  const [qDifficulty, setQDifficulty] = useState('Easy');
  const [qCategory, setQCategory] = useState('');

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
      setError('Failed to load questions pool.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchQuestions();
  }, []);

  const handleToggleSelection = (id) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter(qId => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleCreateQuiz = async (e) => {
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
      setSuccess(`Quiz "${quizTitle}" created successfully with ${selectedQuestionIds.length} questions!`);
      setQuizTitle('');
      setSelectedQuestionIds([]);
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      setError('Failed to create quiz. Make sure backend and database are running.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    setError('');
    setSuccess('');
    try {
      await quizAPI.deleteQuiz(id);
      setSuccess('Quiz removed.');
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      setError('Failed to delete quiz. It may be referenced in attempts.');
    }
  };

  const handleAddQuestionInline = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!qTitle.trim() || !qOpt1.trim() || !qOpt2.trim()) {
      setError('Inline Question: Question Title and at least Option 1 & 2 are required.');
      return;
    }

    let rightAnsText = '';
    if (qCorrectIdx === 1) rightAnsText = qOpt1;
    else if (qCorrectIdx === 2) rightAnsText = qOpt2;
    else if (qCorrectIdx === 3) rightAnsText = qOpt3;
    else if (qCorrectIdx === 4) rightAnsText = qOpt4;

    if (!rightAnsText.trim()) {
      setError('Inline Question: Selected correct option cannot be empty.');
      return;
    }

    try {
      const payload = {
        questionTitle: qTitle,
        option1: qOpt1,
        option2: qOpt2,
        option3: qOpt3 || null,
        option4: qOpt4 || null,
        rightAnswer: rightAnsText,
        difficultyLevel: qDifficulty,
        category: qCategory || 'General',
      };

      const savedQuestion = await questionAPI.save(payload);
      setSuccess('New question created and linked to this quiz!');
      
      // Auto check it in selection list
      setSelectedQuestionIds([...selectedQuestionIds, savedQuestion.id]);
      
      // Add to local list of questions pool
      setQuestions([...questions, savedQuestion]);

      // Reset inline form
      setQTitle('');
      setQOpt1('');
      setQOpt2('');
      setQOpt3('');
      setQOpt4('');
      setQCorrectIdx(1);
      setQCategory('');
      setQDifficulty('Easy');
      setShowAddQuestion(false);
    } catch (err) {
      console.error(err);
      setError('Failed to create inline question.');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Manage Quizzes</h1>
        <p className="text-slate-400 text-sm mt-1">Create quizzes and link questions to them.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm font-medium animate-pulse">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Create Quiz Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 h-fit"
        >
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FolderPlus size={18} className="text-indigo-400" />
            Create Quiz
          </h3>

          <form onSubmit={handleCreateQuiz} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="E.g., Javascript Event Loop"
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-sm"
                required
              />
            </div>

            {/* Questions Pool List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Link Questions</label>
                <span className="text-xs text-indigo-455 font-bold">{selectedQuestionIds.length} selected</span>
              </div>

              {/* Toggle Inline Form Trigger */}
              <button
                type="button"
                onClick={() => setShowAddQuestion(!showAddQuestion)}
                className="w-full py-2 px-3 border border-dashed border-indigo-500/30 rounded-xl text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 hover:bg-indigo-950/20 transition-all font-semibold"
              >
                {showAddQuestion ? <X size={14} /> : <Plus size={14} />}
                {showAddQuestion ? 'Close Question Form' : 'Write & Link New Question'}
              </button>

              {/* Inline Question Add Form */}
              <AnimatePresence>
                {showAddQuestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border border-indigo-500/25 bg-slate-950/80 rounded-2xl p-4 space-y-4"
                  >
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <HelpCircle size={14} className="text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">New Question Form</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Question Title</label>
                      <input
                        type="text"
                        value={qTitle}
                        onChange={(e) => setQTitle(e.target.value)}
                        placeholder="Statement title..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Options & Correct Selection</label>
                      
                      {/* Option inputs */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="inline-correct" 
                            checked={qCorrectIdx === 1}
                            onChange={() => setQCorrectIdx(1)}
                            className="w-3.5 h-3.5 accent-indigo-500 shrink-0 cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={qOpt1}
                            onChange={(e) => setQOpt1(e.target.value)}
                            placeholder="Option 1 text..."
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-350 placeholder-slate-650"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="inline-correct" 
                            checked={qCorrectIdx === 2}
                            onChange={() => setQCorrectIdx(2)}
                            className="w-3.5 h-3.5 accent-indigo-500 shrink-0 cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={qOpt2}
                            onChange={(e) => setQOpt2(e.target.value)}
                            placeholder="Option 2 text..."
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-350 placeholder-slate-650"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="inline-correct" 
                            checked={qCorrectIdx === 3}
                            onChange={() => setQCorrectIdx(3)}
                            className="w-3.5 h-3.5 accent-indigo-500 shrink-0 cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={qOpt3}
                            onChange={(e) => setQOpt3(e.target.value)}
                            placeholder="Option 3 text..."
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-350 placeholder-slate-650"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="inline-correct" 
                            checked={qCorrectIdx === 4}
                            onChange={() => setQCorrectIdx(4)}
                            className="w-3.5 h-3.5 accent-indigo-500 shrink-0 cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={qOpt4}
                            onChange={(e) => setQOpt4(e.target.value)}
                            placeholder="Option 4 text..."
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-350 placeholder-slate-650"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-500">Difficulty</label>
                        <select 
                          value={qDifficulty} 
                          onChange={(e) => setQDifficulty(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 mt-1"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-500">Category</label>
                        <input 
                          type="text" 
                          value={qCategory} 
                          onChange={(e) => setQCategory(e.target.value)}
                          placeholder="Java" 
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 mt-1"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestionInline}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      Save & Link to Quiz
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scrollable Questions list */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950 p-3 h-52 overflow-y-auto space-y-2 scrollbar-premium mt-2">
                {loadingQuestions ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-10 bg-slate-900 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : questions.length > 0 ? (
                  questions.map((q) => {
                    const isChecked = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleToggleSelection(q.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200' 
                            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-400'
                        }`}
                      >
                        <div className="shrink-0 text-indigo-500">
                          {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-655" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-slate-200">{q.questionTitle}</p>
                          <div className="flex items-center gap-1.5 text-[9px] uppercase font-extrabold text-slate-500 mt-0.5">
                            <span>{q.category}</span>
                            <span>•</span>
                            <span>{q.difficultyLevel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 text-xs text-slate-600">
                    No questions available. Write one above.
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Create Quiz'}
            </button>
          </form>
        </motion.div>

        {/* Existing Quizzes Pool */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              Existing Quizzes ({quizzes.length})
            </h3>
            <button 
              onClick={fetchQuizzes}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {loadingQuizzes ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : quizzes.length > 0 ? (
              quizzes.map((quiz, idx) => {
                const id = quiz.id || idx + 1;
                return (
                  <div 
                    key={id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors group"
                  >
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-200 text-base">{quiz.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-md text-indigo-400 font-extrabold uppercase tracking-wider text-[9px]">
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
                No quizzes exist in the database. Use the form to write and save one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
