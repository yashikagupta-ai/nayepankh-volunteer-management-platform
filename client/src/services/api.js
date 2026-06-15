import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// ── Request interceptor: attach token from localStorage if present ────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('np_token')
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: normalise error messages ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'

    // If token is expired / invalid globally, clear storage
    if (error.response?.status === 401) {
      const msg = error.response?.data?.message || ''
      if (msg.includes('expired') || msg.includes('Invalid token') || msg.includes('no longer exists')) {
        localStorage.removeItem('np_token')
        delete api.defaults.headers.common['Authorization']
        // Don't redirect here — AuthContext will handle it on next load
      }
    }

    return Promise.reject({ ...error, friendlyMessage: message })
  }
)

export const volunteerAPI = {
  register: (data) => api.post('/volunteers', data),
  getAll: (params = {}) => api.get('/volunteers', { params }),
  getMyVolunteer: () => api.get('/volunteers/me'),
  getById: (id) => api.get(`/volunteers/${id}`),
}

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const adminAPI = {
  getVolunteers: (params = {}) => api.get('/admin/volunteers', { params }),
  getStats: () => api.get('/admin/stats'),
  updateStatus: (id, status) => api.patch(`/admin/volunteers/${id}/status`, { status }),
  deleteVolunteer: (id) => api.delete(`/admin/volunteers/${id}`),
  getUsers: () => api.get('/admin/users'),
}

export const chatAPI = {
  sendMessage: (message, history = []) => api.post('/chat', { message, history }),
}

export const intakeAPI = {
  getSession: () => api.get('/intake'),
  sendMessage: (message) => api.post('/intake/chat', { message }),
  resetSession: () => api.post('/intake/reset'),
  getRecommendations: () => api.get('/intake/recommendations'),
}

export default api

