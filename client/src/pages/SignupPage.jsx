import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }
  const { score, label, color } = getStrength()
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 ${score <= 1 ? 'text-red-400' : score <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        Password strength: {label}
      </p>
    </div>
  )
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return 'Please enter your full name (at least 2 characters).'
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return 'Please enter a valid email address.'
    if (form.password.length < 6)
      return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword)
      return 'Passwords do not match.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')
    try {
      await register(form.name.trim(), form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-10 relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, rgba(249,115,22,0.12) 0%, transparent 70%)`,
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=64,h=64,fit=crop,f=png/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png"
              alt="NayePankh Foundation"
              className="w-14 h-14 rounded-full ring-2 ring-orange-500/50 object-cover"
            />
            <span className="text-white font-bold text-xl">
              Naye<span className="text-gradient">Pankh</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mt-4">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the NayePankh volunteer community</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Card */}
        <div className="glass-card p-8">
          <form id="signup-form" onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="form-label">Full Name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Rahul Sharma"
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="form-label">Email Address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="form-input pr-12"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  id="toggle-password-signup"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 transition-colors text-sm"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm-password" className="form-label">Confirm Password</label>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                className={`form-input ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                    : form.confirmPassword && form.password === form.confirmPassword
                    ? 'border-green-500/60 focus:border-green-500 focus:ring-green-500/20'
                    : ''
                }`}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password && (
                <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                '🌟 Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              id="goto-login-link"
              className="text-orange-400 font-semibold hover:text-orange-300 transition-colors duration-200"
            >
              Sign in here →
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {['🔒 Encrypted', '🛡️ bcrypt Hashed', '⚡ JWT Secured'].map((t) => (
            <span key={t} className="text-gray-600 text-xs">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
