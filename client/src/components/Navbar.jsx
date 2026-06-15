import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (to) => location.pathname === to

  // Nav links differ based on auth state
  const navLinks = isAuthenticated
    ? user?.role === 'admin'
      ? [
          { label: 'Home', to: '/' },
          { label: 'Admin Console', to: '/admin/dashboard' },
        ]
      : [
          { label: 'Home', to: '/' },
          { label: 'Register Volunteer', to: '/register' },
          { label: 'AI Intake Agent', to: '/ai-agent' },
          { label: 'Dashboard', to: '/dashboard' },
        ]
    : [
        { label: 'Home', to: '/' },
      ]

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-800/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ────────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=64,h=64,fit=crop,f=png/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png"
                alt="NayePankh Foundation Logo"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-500/50 group-hover:ring-orange-500 transition-all duration-300"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full animate-pulse-slow" />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg leading-none">
                Naye<span className="text-gradient">Pankh</span>
              </span>
              <p className="text-gray-400 text-xs leading-none mt-0.5">Foundation</p>
            </div>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              /* ── User menu ─────────────────────────────────────────────── */
              <div className="relative ml-2">
                <button
                  id="user-menu-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 px-3 py-2 rounded-xl transition-all duration-300"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm text-gray-300 max-w-[100px] truncate">{user?.name}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-dark-800/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden animate-fade-in">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                    {/* Menu items */}
                    <div className="py-1">
                      {user?.role === 'admin' ? (
                        <Link
                          to="/admin/dashboard"
                          id="dropdown-dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <span>🛡️</span> Admin Console
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/dashboard"
                            id="dropdown-dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <span>📊</span> Dashboard
                          </Link>
                          <Link
                            to="/ai-agent"
                            id="dropdown-ai-agent"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <span>🤖</span> AI Intake Agent
                          </Link>
                          <Link
                            to="/register"
                            id="dropdown-volunteer"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <span>🌟</span> Register as Volunteer
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="border-t border-white/5 py-1">
                      <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Auth buttons (not logged in) ─────────────────────────── */
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="btn-secondary text-sm py-2 px-5"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  id="nav-signup-btn"
                  className="btn-primary text-sm py-2.5 px-5"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────────────── */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────────────────── */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-dark-800/98 backdrop-blur-lg border-t border-white/5 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              {/* User info */}
              <div className="px-4 py-3 mt-2 bg-white/3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user?.name}</p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                </div>
              </div>
              <button
                id="mobile-logout-btn"
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 transition-colors"
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 mt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center text-sm py-2.5">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary flex-1 text-center text-sm py-2.5">
                Join Us
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
