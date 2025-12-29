import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, company, phone, country, timezone, preferredLanguage, languages) =>
    api.post('/auth/register', { name, email, password, company, phone, country, timezone, preferredLanguage, languages }),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Conversations APIs
export const conversations = {
  getAll: (params) => api.get('/conversations', { params }),
  getById: (id) => api.get(`/conversations/${id}`),
  assign: (id, agentId) => api.put(`/conversations/${id}/assign`, { agentId }),
  close: (id) => api.put(`/conversations/${id}/close`),
};

// Messages APIs
export const messages = {
  send: (conversationId, content) => api.post('/messages/send', { conversationId, content }),
  getByConversation: (conversationId) => api.get(`/messages/${conversationId}`),
};

// Campaigns APIs
export const campaigns = {
  getAll: () => api.get('/campaigns'),
  getById: (id) => api.get(`/campaigns/${id}`),
  import: (formData) => api.post('/campaigns/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  launch: (id) => api.post(`/campaigns/${id}/launch`),
};

// Analytics APIs
export const analytics = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCountries: () => api.get('/analytics/countries'),
  getAgents: () => api.get('/analytics/agents'),
  getTimeline: (days = 7) => api.get('/analytics/timeline', { params: { days } }),
  getCampaigns: () => api.get('/analytics/campaigns'),
};

// Agents APIs
export const agents = {
  getAll: () => api.get('/agents'),
  getMe: () => api.get('/agents/me'),
  updateStatus: (online) => api.put('/agents/me/status', { online }),
  create: (data) => api.post('/agents', data),
  update: (id, data) => api.put(`/agents/${id}`, data),
  delete: (id) => api.delete(`/agents/${id}`),
  resetPassword: (id, newPassword) => api.put(`/agents/${id}/reset-password`, { newPassword }),
};

// WhatsApp APIs
export const whatsapp = {
  getSessions: () => api.get('/whatsapp/sessions'),
  getSession: (sessionId) => api.get(`/whatsapp/sessions/${sessionId}`),
  createSession: (name, proxyCountry = null) => api.post('/whatsapp/sessions', { name, proxyCountry }),
  createSessionWithPhone: (name, phoneNumber, proxyCountry = null) => api.post('/whatsapp/sessions', {
    name,
    usePairingCode: true,
    phoneNumber,
    proxyCountry
  }),
  connectSession: (sessionId) => api.post(`/whatsapp/sessions/${sessionId}/connect`),
  disconnectSession: (sessionId) => api.post(`/whatsapp/sessions/${sessionId}/disconnect`),
  deleteSession: (sessionId) => api.delete(`/whatsapp/sessions/${sessionId}`),
  updateSessionName: (sessionId, newName) => api.patch(`/whatsapp/sessions/${sessionId}/name`, { name: newName }),
  sendMessage: (sessionId, phoneNumber, message) => api.post('/whatsapp/send', { sessionId, phoneNumber, message }),

  // Clear all history
  clearAllHistory: () => api.delete('/whatsapp/clear-all'),

  // Proxy management
  getProxyCountries: () => api.get('/whatsapp/proxy/countries'),
  getProxyStats: () => api.get('/whatsapp/proxy/stats'),
  checkProxyHealth: () => api.post('/whatsapp/proxy/check'),

  // Chat management
  getMe: (sessionId) => api.get(`/whatsapp/sessions/${sessionId}/me`),
  getChats: (sessionId, limit = 50) => api.get(`/whatsapp/sessions/${sessionId}/chats`, { params: { limit } }),
  getChatMessages: (sessionId, chatId, limit = 50) => api.get(`/whatsapp/sessions/${sessionId}/chats/${chatId}/messages`, { params: { limit } }),
  sendChatMessage: (sessionId, chatId, message) => api.post(`/whatsapp/sessions/${sessionId}/chats/${chatId}/send`, { message }),

  // Check if number has WhatsApp
  checkNumber: (sessionId, phoneNumber) => api.post(`/whatsapp/sessions/${sessionId}/check-number`, { phoneNumber }),
};

// AI Chatbot APIs
export const ai = {
  getStatus: () => api.get('/ai/status'),
  initialize: (apiKey) => api.post('/ai/initialize', { apiKey }),
  getConfig: (sessionId) => api.get(`/ai/config/${sessionId}`),
  setConfig: (sessionId, config) => api.post(`/ai/config/${sessionId}`, config),
  disableConfig: (sessionId) => api.delete(`/ai/config/${sessionId}`),
  getAllConfigs: () => api.get('/ai/configs'),
  testResponse: (message, config) => api.post('/ai/test', { message, config }),
  clearHistory: (sessionId, chatId) => api.delete(`/ai/history/${sessionId}/${chatId}`),
};

// 5SIM Virtual Numbers APIs
export const sim = {
  getBalance: () => api.get('/sim/balance'),
  getCountries: () => api.get('/sim/countries'),
  buyNumber: (country, operator = 'any') => api.post('/sim/buy', { country, operator }),
  checkSms: (orderId) => api.get(`/sim/check/${orderId}`),
  waitForSms: (orderId, timeout = 120000) => api.post(`/sim/wait/${orderId}`, { timeout }),
  finishOrder: (orderId) => api.post(`/sim/finish/${orderId}`),
  cancelOrder: (orderId) => api.post(`/sim/cancel/${orderId}`),
  banNumber: (orderId) => api.post(`/sim/ban/${orderId}`),
  getActiveOrders: () => api.get('/sim/orders'),
  getHistory: () => api.get('/sim/history'),
};

// Unified Virtual Numbers APIs (5SIM + SMSPVA + GrizzlySMS)
export const numbers = {
  getProviders: () => api.get('/numbers/providers'),
  getBalance: () => api.get('/numbers/balance'),
  getCountries: (provider = null) => api.get('/numbers/countries', { params: { provider } }),
  buyNumber: (country, provider = '5sim', operator = 'any') => api.post('/numbers/buy', { country, provider, operator }),
  checkSms: (provider, orderId) => api.get(`/numbers/check/${provider}/${orderId}`),
  cancelOrder: (provider, orderId) => api.post(`/numbers/cancel/${provider}/${orderId}`),
  finishOrder: (provider, orderId) => api.post(`/numbers/finish/${provider}/${orderId}`),
  banNumber: (provider, orderId) => api.post(`/numbers/ban/${provider}/${orderId}`),
  getActiveOrders: () => api.get('/numbers/orders'),
  refresh: (provider = null) => api.post('/numbers/refresh', { provider }),
  createWhatsAppSession: (orderId, provider, phoneNumber, proxyCountry = null) => api.post('/numbers/create-whatsapp-session', { orderId, provider, phoneNumber, proxyCountry }),
};

// Scheduled Messages APIs
export const scheduled = {
  schedule: (sessionId, chatId, message, scheduledAt) =>
    api.post('/scheduled', { sessionId, chatId, message, scheduledAt }),
  getAll: (sessionId, status = null) =>
    api.get(`/scheduled/${sessionId}`, { params: { status } }),
  get: (id) => api.get(`/scheduled/message/${id}`),
  update: (id, data) => api.put(`/scheduled/${id}`, data),
  cancel: (id) => api.delete(`/scheduled/${id}`),
};

// Countries APIs
export const countries = {
  getAll: () => api.get('/countries'),
};

// Message Scripts APIs
export const scripts = {
  getAll: () => api.get('/scripts'),
  get: (id) => api.get(`/scripts/${id}`),
  create: (name, description, messages) => api.post('/scripts', { name, description, messages }),
  update: (id, name, description, messages) => api.put(`/scripts/${id}`, { name, description, messages }),
  delete: (id) => api.delete(`/scripts/${id}`),
  execute: (id, sessionId, chatId) => api.post(`/scripts/${id}/execute`, { sessionId, chatId }),
  pauseExecution: (executionId) => api.post(`/scripts/executions/${executionId}/pause`),
  stopExecution: (executionId) => api.post(`/scripts/executions/${executionId}/stop`),
  getActiveExecutions: () => api.get('/scripts/executions/active'),
  getExecutionHistory: () => api.get('/scripts/executions/history'),
};
