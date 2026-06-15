import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const AVAILABILITY_LABELS = {
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  both: 'Weekdays & Weekends',
  flexible: 'Flexible',
}

export default function AdminDashboardPage() {
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [volunteers, setVolunteers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter state for Volunteers
  const [search, setSearch] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterAvail, setFilterAvail] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVolunteers, setTotalVolunteers] = useState(0)

  // Actions states
  const [deletingId, setDeletingId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Auto-hide alert message
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats()
      if (res.data.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  // Fetch Volunteers (with filters)
  const fetchVolunteers = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        search,
        city: filterCity,
        availability: filterAvail,
        status: filterStatus,
        skill: filterSkill,
      }
      const res = await adminAPI.getVolunteers(params)
      if (res.data.success) {
        setVolunteers(res.data.data)
        setTotalPages(res.data.pagination.pages)
        setTotalVolunteers(res.data.pagination.total)
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to fetch volunteers.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers()
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  // Load initial dashboard data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchVolunteers(), fetchUsers()])
      setLoading(false)
    }
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch volunteers whenever filters change
  useEffect(() => {
    fetchVolunteers()
  }, [page, search, filterCity, filterAvail, filterStatus, filterSkill]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page when filter changes
  const handleFilterChange = (setter, val) => {
    setter(val)
    setPage(1)
  }

  // Status Action (Approve/Reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(true)
      const res = await adminAPI.updateStatus(id, newStatus)
      if (res.data.success) {
        setMessage({ text: `Volunteer status successfully updated to ${newStatus}!`, type: 'success' })
        // Refresh stats & volunteers
        fetchStats()
        fetchVolunteers()
      }
    } catch (err) {
      setMessage({ text: err.friendlyMessage || 'Failed to update status.', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Action
  const handleDeleteVolunteer = async (id) => {
    try {
      setActionLoading(true)
      const res = await adminAPI.deleteVolunteer(id)
      if (res.data.success) {
        setMessage({ text: 'Volunteer record deleted successfully.', type: 'success' })
        setDeletingId(null)
        fetchStats()
        fetchVolunteers()
      }
    } catch (err) {
      setMessage({ text: err.friendlyMessage || 'Failed to delete volunteer.', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col md:flex-row pt-16">
      {/* ── Sidebar Navigation ────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-[#0F1524] border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
        {/* Admin info */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
            🛡️
          </div>
          <div>
            <h4 className="font-bold text-white text-sm truncate">{user?.name || 'Admin'}</h4>
            <span className="text-xs text-orange-500 font-medium uppercase tracking-wider">NGO Administrator</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/35 text-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-base">📊</span> Overview
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'volunteers'
                ? 'bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/35 text-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-base">👥</span> Volunteers
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold">
              {stats?.totalVolunteers || volunteers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/35 text-orange-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-base">👤</span> User Accounts
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-bold">
              {users.length}
            </span>
          </button>
        </nav>

        {/* Quick actions at bottom */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-gray-400 hover:text-red-400 text-xs font-bold transition-all duration-200"
          >
            🚪 Logout Dashboard
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Status notification */}
        {message.text && (
          <div
            className={`mb-6 flex items-center gap-3 border rounded-xl p-4 animate-fade-in ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Admin <span className="text-gradient">Console</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              NayePankh Foundation volunteer recruitment metrics and review dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Live Connection</span>
          </div>
        </div>

        {/* ── Tab: Overview ──────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Volunteers',
                  value: stats?.totalVolunteers ?? '...',
                  icon: '👥',
                  gradient: 'from-orange-500 to-amber-500',
                },
                {
                  label: 'Approved Active',
                  value: stats?.activeVolunteers ?? '...',
                  icon: '✓',
                  gradient: 'from-green-500 to-emerald-500',
                },
                {
                  label: 'Pending Approvals',
                  value: stats?.pendingVolunteers ?? '...',
                  icon: '⏳',
                  gradient: 'from-orange-400 to-rose-500',
                },
                {
                  label: 'Registered Users',
                  value: stats?.totalUsers ?? '...',
                  icon: '👤',
                  gradient: 'from-indigo-500 to-purple-500',
                },
              ].map((c) => (
                <div key={c.label} className="glass-card p-5 hover-lift transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{c.label}</p>
                      <h3 className="text-3xl font-black text-white mt-2">{c.value}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-lg shadow-md`}>
                      {c.icon}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                    <span className="text-orange-400">★</span> Real-time aggregated stats
                  </div>
                </div>
              ))}
            </div>

            {/* Distribution metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Top Skills Card */}
              <div className="glass-card p-6 flex flex-col">
                <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <span>💡</span> Common Skills
                </h4>
                <div className="space-y-3 flex-1">
                  {stats?.topSkills && stats.topSkills.length > 0 ? (
                    stats.topSkills.map((sk) => (
                      <div key={sk._id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-gray-300">{sk._id}</span>
                          <span className="text-orange-400 font-bold">{sk.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                            style={{
                              width: `${
                                stats.totalVolunteers > 0 ? (sk.count / stats.totalVolunteers) * 100 : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs">No skill metrics available yet.</p>
                  )}
                </div>
              </div>

              {/* City Distribution Card */}
              <div className="glass-card p-6 flex flex-col">
                <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <span>🏙️</span> City Coverage
                </h4>
                <div className="space-y-3 flex-1">
                  {stats?.cityDistribution && stats.cityDistribution.length > 0 ? (
                    stats.cityDistribution.map((city) => (
                      <div key={city._id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-gray-300">{city._id}</span>
                          <span className="text-orange-400 font-bold">{city.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
                            style={{
                              width: `${
                                stats.totalVolunteers > 0 ? (city.count / stats.totalVolunteers) * 100 : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs">No city records available.</p>
                  )}
                </div>
              </div>

              {/* Availability Breakdown */}
              <div className="glass-card p-6 flex flex-col">
                <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <span>📅</span> Availability Profile
                </h4>
                <div className="space-y-3 flex-1">
                  {stats?.availabilityDistribution && stats.availabilityDistribution.length > 0 ? (
                    stats.availabilityDistribution.map((av) => (
                      <div key={av._id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-gray-300">
                            {AVAILABILITY_LABELS[av._id] || av._id}
                          </span>
                          <span className="text-orange-400 font-bold">{av.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-rose-600 rounded-full"
                            style={{
                              width: `${
                                stats.totalVolunteers > 0 ? (av.count / stats.totalVolunteers) * 100 : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs">No availability profiles found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Volunteers (List & Manage) ─────────────────────────────────── */}
        {activeTab === 'volunteers' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filters panel */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <span>🔍</span> Filter Volunteers
                </h3>
                <button
                  onClick={() => {
                    setSearch('')
                    setFilterCity('')
                    setFilterAvail('')
                    setFilterStatus('')
                    setFilterSkill('')
                  }}
                  className="text-xs text-gray-500 hover:text-orange-400 transition-colors"
                >
                  Clear Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Search query */}
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Search Name/Email
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                    placeholder="Search query..."
                    className="form-input text-xs h-9 bg-white/5 border-white/5 py-1"
                  />
                </div>

                {/* Filter status */}
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Application Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                    className="form-input text-xs h-9 bg-[#121A2A] border-white/5 py-1"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Filter city */}
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                    City location
                  </label>
                  <input
                    type="text"
                    value={filterCity}
                    onChange={(e) => handleFilterChange(setFilterCity, e.target.value)}
                    placeholder="Filter by city..."
                    className="form-input text-xs h-9 bg-white/5 border-white/5 py-1"
                  />
                </div>

                {/* Filter availability */}
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Availability
                  </label>
                  <select
                    value={filterAvail}
                    onChange={(e) => handleFilterChange(setFilterAvail, e.target.value)}
                    className="form-input text-xs h-9 bg-[#121A2A] border-white/5 py-1"
                  >
                    <option value="">All Availability</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="both">Both</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                {/* Filter skill */}
                <div>
                  <label className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Skill Requirement
                  </label>
                  <input
                    type="text"
                    value={filterSkill}
                    onChange={(e) => handleFilterChange(setFilterSkill, e.target.value)}
                    placeholder="Filter by skill..."
                    className="form-input text-xs h-9 bg-white/5 border-white/5 py-1"
                  />
                </div>
              </div>
            </div>

            {/* Volunteers Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0F1524] text-xs font-bold text-gray-400">
                      <th className="p-4">Volunteer Info</th>
                      <th className="p-4">Skills</th>
                      <th className="p-4">Interests</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12">
                          <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-2" />
                          <span className="text-xs text-gray-500">Loading volunteers...</span>
                        </td>
                      </tr>
                    ) : volunteers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-gray-500 text-xs">
                          No volunteers found matching your selection criteria.
                        </td>
                      </tr>
                    ) : (
                      volunteers.map((vol) => (
                        <tr key={vol._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                          {/* Info */}
                          <td className="p-4">
                            <div className="font-bold text-white leading-snug">{vol.fullName}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{vol.email}</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                              <span>📞 +91 {vol.phone}</span>
                              <span>•</span>
                              <span>📍 {vol.city}</span>
                            </div>
                          </td>

                          {/* Skills */}
                          <td className="p-4 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {vol.skills && vol.skills.length > 0 ? (
                                vol.skills.map((s) => (
                                  <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-orange-400">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-xs italic">—</span>
                              )}
                            </div>
                          </td>

                          {/* Interests */}
                          <td className="p-4 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {vol.interests && vol.interests.length > 0 ? (
                                vol.interests.map((i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-rose-400">
                                    {i}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-xs italic">—</span>
                              )}
                            </div>
                          </td>

                          {/* Availability */}
                          <td className="p-4 text-xs font-semibold text-gray-300">
                            {AVAILABILITY_LABELS[vol.availability] || vol.availability}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                vol.status === 'approved'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : vol.status === 'rejected'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              }`}
                            >
                              {vol.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {vol.status !== 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(vol._id, 'approved')}
                                  disabled={actionLoading}
                                  title="Approve Volunteer"
                                  className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 transition-colors"
                                >
                                  ✓
                                </button>
                              )}
                              {vol.status !== 'rejected' && (
                                <button
                                  onClick={() => handleStatusChange(vol._id, 'rejected')}
                                  disabled={actionLoading}
                                  title="Reject Volunteer"
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
                                >
                                  ❌
                                </button>
                              )}
                              {deletingId === vol._id ? (
                                <div className="flex items-center gap-1 animate-fade-in">
                                  <button
                                    onClick={() => handleDeleteVolunteer(vol._id)}
                                    disabled={actionLoading}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(vol._id)}
                                  title="Delete Volunteer"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-white/5 text-gray-400 transition-colors"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {!loading && totalPages > 1 && (
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#0F1524]/50">
                  <span className="text-xs text-gray-500">
                    Showing {volunteers.length} of {totalVolunteers} volunteers
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-xs border border-white/5 rounded bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40"
                    >
                      ◄ Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-6 h-6 text-xs rounded border font-semibold ${
                          page === i + 1
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'border-white/5 bg-white/5 hover:bg-white/10 text-gray-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-xs border border-white/5 rounded bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40"
                    >
                      Next ►
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Users (Registered Accounts) ───────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0F1524] text-xs font-bold text-gray-400">
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">System Role</th>
                      <th className="p-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-gray-500 text-xs">
                          No registered user accounts found.
                        </td>
                      </tr>
                    ) : (
                      users.map((acc) => (
                        <tr key={acc._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                          <td className="p-4 font-bold text-white">{acc.name}</td>
                          <td className="p-4 text-gray-300">{acc.email}</td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                acc.role === 'admin'
                                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                              }`}
                            >
                              🔑 {acc.role}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {new Date(acc.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
