import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('np_token') || null)
  const [loading, setLoading] = useState(true) // true until we verify token on mount

  // ── Set token in state + localStorage + axios default header ───────────────
  const saveToken = useCallback((newToken) => {
    setToken(newToken)
    if (newToken) {
      localStorage.setItem('np_token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('np_token')
      delete api.defaults.headers.common['Authorization']
    }
  }, [])

  // ── On mount: if token exists, fetch the current user ─────────────────────
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      // Attach token for this request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.user)
      } catch {
        // Token invalid / expired — clear it
        saveToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    saveToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    saveToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    saveToken(null)
    setUser(null)
  }, [saveToken])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook for easy consumption
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
