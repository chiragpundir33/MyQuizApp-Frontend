import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  UserCheck, 
  UserX, 
  X,
  Calendar,
  ShieldAlert,
  User,
  CheckCircle2,
  AlertTriangle,
  Link2,
  BookOpen,
  Trash2
} from 'lucide-react';
import apiClient from '../services/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../services/api';

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals / Actions states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState(null);
  const [selectedQuizIdToAssign, setSelectedQuizIdToAssign] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/user/getAllUser');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user accounts catalog.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await apiClient.get('/quiz/getAll');
      setQuizzes(res.data || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const data = await assignmentAPI.getAllAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleRevokeAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to revoke this quiz assignment?')) return;
    setError('');
    setSuccess('');
    try {
      await assignmentAPI.deleteAssignment(assignmentId);
      setSuccess('Quiz assignment successfully revoked.');
      fetchAssignments();
    } catch (err) {
      console.error(err);
      setError('Failed to revoke quiz assignment.');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchQuizzes();
    fetchAssignments();
  }, [token]);

  // Toggle user active/inactive status
  const handleToggleStatus = async (userRecord) => {
    setError('');
    setSuccess('');
    setActionLoadingId(userRecord.id);
    try {
      const updatedStatus = userRecord.isActive === false ? true : false;
      
      await apiClient.put(`/user/update/${userRecord.id}`, {
        name: userRecord.name,
        isActive: updatedStatus
      });

      setSuccess(`User "${userRecord.name}" status updated to ${updatedStatus ? 'ACTIVE' : 'INACTIVE'}.`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(`Failed to update status for ${userRecord.name}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit quiz assignment
  const handleAssignQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedQuizIdToAssign) {
      setError('Please select a quiz to assign.');
      return;
    }

    setAssignLoading(true);
    try {
      let formattedDueDate = dueDate;
      if (!formattedDueDate) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        formattedDueDate = defaultDate.toISOString().slice(0, 19);
      } else {
        if (formattedDueDate.length === 16) {
          formattedDueDate += ":00";
        }
      }

      await assignmentAPI.assignQuiz(
        selectedUserForAssign.id,
        parseInt(selectedQuizIdToAssign),
        formattedDueDate
      );

      const matchedQuiz = quizzes.find(q => q.id === parseInt(selectedQuizIdToAssign));
      setSuccess(`Successfully assigned quiz "${matchedQuiz?.title || 'Selected Quiz'}" to user "${selectedUserForAssign.name}".`);
      setSelectedUserForAssign(null);
      setSelectedQuizIdToAssign('');
      setDueDate('');
      fetchAssignments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to assign quiz to user.');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Users className="text-indigo-400" />
          User Account Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor registered profiles, audit roles, and toggle account states (active/inactive).
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

      {/* User Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-505 text-xs font-bold uppercase tracking-wider">
                <th className="p-5">User</th>
                <th className="p-5">Email Address</th>
                <th className="p-5">Authority Role</th>
                <th className="p-5">Account Status</th>
                <th className="p-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-28" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-40" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-16" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-16" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((usr) => (
                  <tr key={usr.id} className="text-slate-300 hover:bg-slate-850/20 transition-colors">
                    {/* User profile */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-xl text-slate-400">
                          <User size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block">{usr.name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">ID: #{usr.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-5 text-slate-450 text-sm">
                      {usr.email || 'N/A'}
                    </td>

                    {/* Role */}
                    <td className="p-5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        usr.role === 'ADMIN' 
                          ? 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {usr.role || 'USER'}
                      </span>
                    </td>

                    {/* Status Toggle Display */}
                    <td className="p-5">
                      {usr.isActive !== false ? (
                        <div className="flex items-center gap-1.5 text-emerald-450 font-bold text-xs">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-400">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-450 font-bold text-xs">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-red-400">Inactive</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2.5">
                        {/* Assign Quiz Button */}
                        <button
                          onClick={() => setSelectedUserForAssign(usr)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-indigo-350 transition-colors"
                          title="Assign Quiz"
                        >
                          <Link2 size={15} />
                        </button>

                        <button
                          onClick={() => setSelectedUser(usr)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(usr)}
                          disabled={actionLoadingId === usr.id}
                          className={`p-2 rounded-xl border transition-colors ${
                            usr.isActive !== false 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title={usr.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {actionLoadingId === usr.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : usr.isActive !== false ? (
                            <UserX size={15} />
                          ) : (
                            <UserCheck size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500 text-sm">
                    No registered user accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Active Quiz Assignments Table */}
      <div className="border-b border-slate-800 pb-4 pt-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-indigo-400" size={20} />
          Active Quiz Assignments
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Monitor assigned quiz topics, statuses, and revoke assignments if necessary.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-5">Quiz Topic</th>
                <th className="p-5">Assigned To</th>
                <th className="p-5">Assigned At</th>
                <th className="p-5">Due Date</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loadingAssignments ? (
                [1, 2].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-28" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-28" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-32" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-32" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-16" /></td>
                    <td className="p-5"><div className="h-6 bg-slate-850 rounded-lg w-10 ml-auto" /></td>
                  </tr>
                ))
              ) : assignments.length > 0 ? (
                assignments.map((assignment) => {
                  const assignedUser = users.find(u => u.id === assignment.userId);
                  return (
                    <tr key={assignment.id} className="hover:bg-slate-850/20 transition-colors">
                      <td className="p-5 font-bold text-slate-200">
                        {assignment.quizTitle || 'Quiz #' + assignment.quizId}
                      </td>
                      <td className="p-5 text-sm">
                        {assignedUser ? assignedUser.name : `User #${assignment.userId}`}
                      </td>
                      <td className="p-5 text-xs text-slate-400">
                        {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-5 text-xs text-slate-400">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No Limit'}
                      </td>
                      <td className="p-5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          assignment.status === 'COMPLETED' 
                            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-450' 
                            : assignment.status === 'EXPIRED'
                            ? 'bg-red-500/10 border border-red-500/25 text-red-450'
                            : 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400'
                        }`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => handleRevokeAssignment(assignment.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
                          title="Revoke Assignment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 text-sm">
                    No active quiz assignments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">{selectedUser.name}</h3>
                  <span className="text-xs text-slate-500 font-semibold">User ID: #{selectedUser.id}</span>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-350">
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">Email Address:</span>
                  <span className="text-slate-200 font-semibold">{selectedUser.email || 'N/A'}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">Authority Level:</span>
                  <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs">
                    {selectedUser.role || 'USER'}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Account Status:</span>
                  <span className={`font-bold text-xs uppercase ${
                    selectedUser.isActive !== false ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-colors"
              >
                Dismiss Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Quiz Modal */}
      <AnimatePresence>
        {selectedUserForAssign && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => {
                  setSelectedUserForAssign(null);
                  setSelectedQuizIdToAssign('');
                }}
                className="absolute top-4 right-4 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Assign Quiz</h3>
                  <span className="text-xs text-slate-500 font-semibold">Assigning to: {selectedUserForAssign.name}</span>
                </div>
              </div>

              <form onSubmit={handleAssignQuiz} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-slate-400">Select Quiz Challenge</label>
                  <select
                    value={selectedQuizIdToAssign}
                    onChange={(e) => setSelectedQuizIdToAssign(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Choose Quiz Topic --</option>
                    {quizzes.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.title} (ID: #{q.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-slate-400">Set Due Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">Defaults to 7 days from now if left empty</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserForAssign(null);
                      setSelectedQuizIdToAssign('');
                    }}
                    className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="py-3 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition-all"
                  >
                    {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
