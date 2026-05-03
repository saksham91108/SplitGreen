// API service for SplitGreen backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get auth token
const getToken = () => localStorage.getItem('access_token');

// Helper for authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid — clear storage and dispatch event for App to handle
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Session expired. Please sign in again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Request failed');
  }

  return data;
};

// ── AUTH ─────────────────────────────────────────────────────────────
export const api = {
  signup: async (name, email, password) => {
    return authFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirm_password: password, agree_terms: true }),
    });
  },

  signin: async (email, password, remember_me = false) => {
    return authFetch('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember_me }),
    });
  },

  googleSignin: async (credential) => {
    return authFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  verifyOtp: async (email, otp) => {
    return authFetch('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resendOtp: async (email) => {
    return authFetch('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  logout: async () => {
    return authFetch('/auth/logout', { method: 'POST' });
  },

  // ── USERS ──────────────────────────────────────────────────────────
  getMe: async () => authFetch('/users/me'),

  updateMe: async (updates) => authFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  getStats: async () => authFetch('/users/me/stats'),

  updatePreferences: async (prefs) => authFetch('/users/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  }),

  completeOnboarding: async () => authFetch('/users/me/onboarding-complete', { method: 'POST' }),

  deleteAccount: async () => authFetch('/users/me', { method: 'DELETE' }),

  // ── GROUPS ─────────────────────────────────────────────────────────
  getGroups: async () => authFetch('/groups'),

  getGroup: async (groupId) => authFetch(`/groups/${groupId}`),

  createGroup: async (name, default_split = 'equally') => authFetch('/groups', {
    method: 'POST',
    body: JSON.stringify({ name, default_split }),
  }),

  updateGroup: async (groupId, updates) => authFetch(`/groups/${groupId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  addMember: async (groupId, email) => authFetch(`/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  removeMember: async (groupId, userId) => authFetch(`/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
  }),

  leaveGroup: async (groupId) => authFetch(`/groups/${groupId}/leave`, { method: 'DELETE' }),
  deleteGroup: async (groupId) => authFetch(`/groups/${groupId}`, { method: 'DELETE' }),

  getInviteLink: async (groupId) => authFetch(`/groups/${groupId}/invite-link`),

  joinGroup: async (inviteCode) => authFetch(`/groups/join/${inviteCode}`, { method: 'POST' }),

  getGroupBalances: async (groupId) => authFetch(`/groups/${groupId}/balances`),

  // ── EXPENSES ───────────────────────────────────────────────────────
  getExpenses: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.group_id) params.append('group_id', filters.group_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const query = params.toString();
    return authFetch(`/expenses${query ? '?' + query : ''}`);
  },

  createExpense: async (expenseData) => authFetch('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  }),

  deleteExpense: async (expenseId) => authFetch(`/expenses/${expenseId}`, { method: 'DELETE' }),

  getSharePreview: async (amount, groupId, splitType = 'equally') => {
    const params = new URLSearchParams({ amount, group_id: groupId, split_type: splitType });
    return authFetch(`/expenses/share-preview?${params}`);
  },

  // ── RECEIPTS ───────────────────────────────────────────────────────
  parseReceipt: async (rawText) => authFetch('/receipts/parse', {
    method: 'POST',
    body: JSON.stringify({ raw_text: rawText }),
  }),

  confirmReceipt: async (receiptData) => authFetch('/receipts/confirm', {
    method: 'POST',
    body: JSON.stringify(receiptData),
  }),

  getReceiptSummary: async (shareToken) =>
    fetch(`${API_BASE}/receipts/summary/${shareToken}`).then(r => r.json()),

  // ── SETTLEMENTS ────────────────────────────────────────────────────
  getSettlements: async () => authFetch('/settlements'),

  recordSettlement: async (settlementId) => authFetch(`/settlements/${settlementId}/record`, { method: 'POST' }),

  deleteSettlement: async (settlementId) => authFetch(`/settlements/${settlementId}`, { method: 'DELETE' }),

  clearSettledTransactions: async () => authFetch('/settlements/settled/clear', { method: 'DELETE' }),

  getSmartSettlements: async () => authFetch('/settlements/smart'),

  applySmartSettlements: async () => authFetch('/settlements/apply-smart', { method: 'POST' }),

  sendReminder: async (userId) => authFetch(`/settlements/remind/${userId}`, { method: 'POST' }),

  // ── ACTIVITY ───────────────────────────────────────────────────────
  getActivity: async (limit = 10) => authFetch(`/activity?limit=${limit}`),

  getGroupActivity: async (groupId, limit = 20) => authFetch(`/activity/groups/${groupId}?limit=${limit}`),

  // ── NOTIFICATIONS ──────────────────────────────────────────────────
  getNotifications: async () => authFetch('/notifications'),

  markNotificationRead: async (notificationId) => authFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: async () => authFetch('/notifications/read-all', { method: 'PATCH' }),
};