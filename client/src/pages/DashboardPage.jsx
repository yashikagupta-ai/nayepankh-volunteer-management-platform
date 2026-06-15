import { useState, useEffect } from 'react'
import { useLocation, Link, Navigate } from 'react-router-dom'
import { volunteerAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const AVAILABILITY_LABELS = {
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  both: 'Weekdays & Weekends',
  flexible: 'Flexible',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const location = useLocation()
  const { success } = location.state || {}

  const [volunteer, setVolunteer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(!!success)

  // Redirect admins to admin console
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => setShowSuccess(false), 6000)
      return () => clearTimeout(t)
    }
  }, [showSuccess])

  useEffect(() => {
    const fetchMyVolunteer = async () => {
      try {
        setLoading(true)
        const res = await volunteerAPI.getMyVolunteer()
        setVolunteer(res.data.data) // Will be the object or null
      } catch (err) {
        setError(err.friendlyMessage || 'Failed to load volunteer details.')
      } finally {
        setLoading(false)
      }
    }
    fetchMyVolunteer()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your volunteer profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative bg-dark-900">
      {/* Glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 0%, rgba(249,115,22,0.06) 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="badge mb-4">Volunteer Profile</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            My <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-gray-400">
            Welcome back, {user?.name}! Track your volunteering status and details here.
          </p>
        </div>

        {/* Success Banner */}
        {showSuccess && (
          <div className="mb-8 flex items-start gap-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-5 animate-fade-in">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              🎉
            </div>
            <div>
              <p className="text-green-400 font-semibold">Welcome to the NayePankh Family!</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Your volunteer application has been submitted successfully.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-gray-500 hover:text-white text-lg"
            >
              ×
            </button>
          </div>
        )}

        {error ? (
          <div className="text-center py-16 glass-card">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm px-6 py-2 mt-4"
            >
              Retry
            </button>
          </div>
        ) : !volunteer ? (
          /* User has NOT registered yet */
          <div className="text-center py-16 glass-card border border-white/5 bg-white/[0.01]">
            <div className="text-6xl mb-6">🌱</div>
            <h3 className="text-white font-extrabold text-2xl mb-3">Become a Volunteer</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Join NayePankh Foundation today! Submit your skills and interests, and start contributing to underprivileged communities across India.
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              <span>🌟</span> Register as Volunteer Now
            </Link>
          </div>
        ) : (
          /* User HAS registered */
          <div className="space-y-6">
            {/* Status Card */}
            <div
              className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-5 transition-all duration-300 ${
                volunteer.status === 'approved'
                  ? 'bg-green-500/5 border-green-500/20 shadow-lg shadow-green-500/5'
                  : volunteer.status === 'rejected'
                  ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5'
                  : 'bg-orange-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  volunteer.status === 'approved'
                    ? 'bg-green-500/20 text-green-400'
                    : volunteer.status === 'rejected'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {volunteer.status === 'approved' ? '✓' : volunteer.status === 'rejected' ? '❌' : '⏳'}
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2.5">
                  <h3 className="text-white font-bold text-lg">Application Status</h3>
                  <span
                    className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mx-auto md:mx-0 ${
                      volunteer.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : volunteer.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {volunteer.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                  {volunteer.status === 'approved'
                    ? 'Congratulations! Your application has been approved. Our team will get in touch with you shortly to coordinate onboarding.'
                    : volunteer.status === 'rejected'
                    ? 'We appreciate your interest in volunteering. Unfortunately, your application has not been approved at this time. Feel free to contact our support if you have any questions.'
                    : 'Your application is currently pending review. We will notify you once your application has been verified by the NGO administration.'}
                </p>
              </div>
            </div>

            {/* Profile Info Details Card */}
            <div className="glass-card p-6 md:p-8">
              <div className="border-b border-white/5 pb-5 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-orange-500/20">
                  {volunteer.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{volunteer.fullName}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">📍 Registered from {volunteer.city}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Email Address</p>
                  <p className="text-gray-300 text-sm">{volunteer.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Phone Number</p>
                  <p className="text-gray-300 text-sm">+91 {volunteer.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Availability</p>
                  <p className="text-gray-300 text-sm">
                    {AVAILABILITY_LABELS[volunteer.availability] || volunteer.availability}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Registered On</p>
                  <p className="text-gray-300 text-sm font-medium">
                    {new Date(volunteer.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {volunteer.skills?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-semibold">Skills & Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {volunteer.skills.map((s) => (
                      <span key={s} className="badge">💡 {s}</span>
                    ))}
                  </div>
                </div>
              )}

              {volunteer.interests?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-semibold">Interests & Causes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {volunteer.interests.map((i) => (
                      <span key={i} className="badge">🎯 {i}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
