import apiClient from './axiosConfig';

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // { message, token }
  },
  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data; // { message, token }
  },
};

export const quizAPI = {
  getAll: async () => {
    const response = await apiClient.get('/quiz/getAll');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/quiz/getById/${id}`);
    return response.data;
  },
  getUserQuizById: async (id) => {
    const response = await apiClient.get(`/userQuiz/getById/${id}`);
    return response.data;
  },
  saveQuiz: async (quizData) => {
    const response = await apiClient.post('/quiz/save', quizData);
    return response.data;
  },
  deleteQuiz: async (id) => {
    await apiClient.delete(`/quiz/delete/${id}`);
  },
  getQuestions: async (quizId) => {
    const response = await apiClient.get(`/quiz/${quizId}/questions`);
    return response.data; // Array of { id, questionTitle, option1, option2, option3, option4 }
  },
  startQuiz: async (userId, quizId) => {
    // Calls UserQuizController to initialize the quiz attempt record
    const response = await apiClient.post('/userQuiz/save', {
      userSid: userId,
      quizSid: quizId,
    });
    return response.data; // { id, userSid, quizSid, score, attemptedAt }
  },
  submitQuiz: async (userQuizId, answers) => {
    // answers is array of { questionId, selectedAnswer }
    const response = await apiClient.post('/quiz/submit', {
      userQuizId,
      answers,
    });
    return response.data; // { quizId, totalQuestions, correctAnswers, score, percentage, result }
  },
  reviewQuiz: async (userQuizId) => {
    const response = await apiClient.get(`/quiz/review/${userQuizId}`);
    return response.data; // List of { questionId, questionTitle, selectedAnswer, correctAnswer, isCorrect }
  },
  getHistory: async (userId) => {
    const response = await apiClient.get(`/quiz/history/${userId}`);
    return response.data; // List of { quizName, score, totalQuestions, attemptedAt }
  },
  getHighestScore: async (userId) => {
    const response = await apiClient.get(`/quiz/highest-score/${userId}`);
    return response.data; // { userId, highestScore }
  },
  getLeaderboard: async () => {
    const response = await apiClient.get('/quiz/leaderboard');
    return response.data; // List of { rank, username, highestScore }
  },
};

export const questionAPI = {
  save: async (questionData) => {
    const response = await apiClient.post('/question/save', questionData);
    return response.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/question/getAll');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/question/getById/${id}`);
    return response.data;
  },
  update: async (id, questionData) => {
    const response = await apiClient.put(`/question/update/${id}`, questionData);
    return response.data;
  },
  delete: async (id) => {
    await apiClient.delete(`/question/delete/${id}`);
  },
};

export const notificationAPI = {
  getNotifications: async (userId) => {
    const response = await apiClient.get(`/notifications/${userId}`);
    return response.data;
  },
  getUnreadCount: async (userId) => {
    const response = await apiClient.get(`/notifications/unread/${userId}`);
    return response.data;
  },
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/read/${notificationId}`);
    return response.data;
  },
};

export const assignmentAPI = {
  assignQuiz: async (userId, quizId, dueDate) => {
    const response = await apiClient.post('/admin/assign-quiz', {
      userId,
      quizId,
      dueDate,
    });
    return response.data;
  },
  getUserAssignments: async (userId) => {
    const response = await apiClient.get(`/assignments/user/${userId}`);
    return response.data;
  },
  getAllAssignments: async () => {
    const response = await apiClient.get('/assignments/all');
    return response.data;
  },
  deleteAssignment: async (id) => {
    const response = await apiClient.delete(`/assignments/delete/${id}`);
    return response.data;
  },
};

export default apiClient;
