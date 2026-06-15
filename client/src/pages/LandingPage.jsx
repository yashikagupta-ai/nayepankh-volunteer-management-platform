import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const stats = [
  { number: '2L+', label: 'People Helped', icon: '🤝' },
  { number: '5000+', label: 'Active Volunteers', icon: '👥' },
  { number: '50+', label: 'Cities', icon: '🏙️' },
  { number: '8+', label: 'Years of Impact', icon: '🌟' },
]

const benefits = [
  {
    icon: '📜',
    title: 'Official Certificate',
    description: 'Receive a government-recognized internship/volunteer certificate upon completion.',
  },
  {
    icon: '🌱',
    title: 'Real Social Impact',
    description: 'Directly contribute to food drives, education camps, and healthcare initiatives.',
  },
  {
    icon: '🤝',
    title: 'Build Your Network',
    description: 'Connect with 5000+ like-minded change-makers across India.',
  },
  {
    icon: '💼',
    title: 'Career Boost',
    description: 'Add meaningful social work experience to your résumé or LinkedIn profile.',
  },
  {
    icon: '📚',
    title: 'Skill Development',
    description: 'Develop leadership, communication, and project management skills.',
  },
  {
    icon: '🏆',
    title: 'Recognition & Awards',
    description: 'Top volunteers are recognized nationally at NayePankh annual events.',
  },
]

const missions = [
  {
    icon: '🍱',
    title: 'Free Food Distribution',
    description: 'Regular drives providing nutritious meals to underprivileged families.',
    color: 'from-orange-500/20 to-red-500/10',
  },
  {
    icon: '📖',
    title: 'Free Education',
    description: 'Tuition centres and learning materials for children who cannot afford school.',
    color: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    icon: '🏥',
    title: 'Healthcare Drives',
    description: 'Free medical camps and sanitary pad distribution for women and girls.',
    color: 'from-green-500/20 to-teal-500/10',
  },
  {
    icon: '👗',
    title: 'Clothes Distribution',
    description: 'Seasonal clothing drives ensuring warmth and dignity for all.',
    color: 'from-purple-500/20 to-pink-500/10',
  },
]

function AnimatedCounter({ target, duration = 2000 }) {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{target}</span>
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const volunteerLink = isAuthenticated ? '/register' : '/signup'
  const dashboardLink = isAuthenticated ? '/dashboard' : '/signup'
  return (
    <div className="overflow-hidden">
      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center text-center px-4"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 161, 155, 0.15) 0%, transparent 70%),
            #E4DDD3
          `,
        }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00A19B]/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00A19B]/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00A19B]/2 rounded-full blur-3xl" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#00A19B]/10 border border-[#00A19B]/30 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 bg-[#00A19B] rounded-full animate-pulse" />
            <span className="text-[#007A75] text-sm font-medium">UP Govt. Registered NGO • 80G & 12A Certified</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black mb-6 leading-tight">
            Give Wings to{' '}
            <span className="text-black">Change</span>
            <br />
            Volunteer with Us
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            NayePankh Foundation is one of India&apos;s biggest student-led NGOs. We&apos;ve uplifted{' '}
            <strong className="text-orange-400">2 lakh+</strong> underprivileged lives through food,
            education, and healthcare. Join our mission — every action counts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link id="hero-cta-register" to={volunteerLink} className="btn-primary text-lg px-10 py-4 glow-orange">
              🌟 Become a Volunteer
            </Link>
            <a
              id="hero-cta-website"
              href="https://nayepankh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-10 py-4"
            >
              Visit Our Website →
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex justify-center">
            <div className="w-6 h-10 border-2 border-orange-500/40 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-orange-500 rounded-full mt-1.5 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ───────────────────────────────────────────────────── */}
      <section id="stats" className="py-16 bg-dark-800/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ number, label, icon }) => (
              <div key={label} className="text-center hover-lift">
                <div className="text-4xl mb-2 animate-float">{icon}</div>
                <div className="stat-number">
                  <AnimatedCounter target={number} />
                </div>
                <p className="text-gray-400 text-sm mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION SECTION ─────────────────────────────────────────────────── */}
      <section id="mission" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge mb-4">Our Mission</span>
            <h2 className="section-heading">What We Do</h2>
            <p className="section-subheading mx-auto">
              Four pillars of change that transform communities and restore dignity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {missions.map(({ icon, title, description, color }) => (
              <div
                key={title}
                className={`glass-card p-6 hover-lift cursor-default group bg-gradient-to-br ${color} relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/3 transition-all duration-500" />
                <div className="text-4xl mb-4 animate-float">{icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="mt-16 text-center glass-card p-10 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-4 left-6 text-orange-500/20 text-8xl font-serif leading-none">"</div>
            <p className="text-gray-200 text-xl md:text-2xl italic relative z-10 leading-relaxed">
              If we all do something, then together there is no problem that we cannot solve!
            </p>
            <p className="text-orange-400 font-semibold mt-4 text-sm">— NayePankh Foundation</p>
          </div>
        </div>
      </section>

      {/* ── BENEFITS SECTION ─────────────────────────────────────────────────── */}
      <section id="benefits" className="py-24 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge mb-4">Why Volunteer?</span>
            <h2 className="section-heading">Benefits of Joining Us</h2>
            <p className="section-subheading mx-auto">
              Grow personally and professionally while making a real difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon, title, description }, index) => (
              <div
                key={title}
                id={`benefit-${index + 1}`}
                className="glass-card p-7 hover-lift group transition-all duration-300 hover:border-orange-500/30 cursor-default"
              >
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:bg-orange-500/20 transition-colors duration-300">
                  {icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section
        id="cta"
        className="py-28 px-4 text-center relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0, 161, 155, 0.1) 0%, transparent 70%),
            #E4DDD3
          `,
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#00A19B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#00A19B]/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#00A19B]/10 border border-[#00A19B]/30 rounded-full px-4 py-2 mb-6">
            <span className="text-[#007A75] text-sm">Ready to make a difference?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#00A19B] mb-6">
            Be the Change
            <br />
            <span className="text-gradient">India Needs</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10">
            Join thousands of volunteers already transforming lives. Registration takes less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link id="cta-register-btn" to={volunteerLink} className="btn-primary text-lg px-12 py-4 glow-orange">
              🚀 Register as Volunteer
            </Link>
            <Link id="cta-dashboard-btn" to={dashboardLink} className="btn-secondary text-lg px-12 py-4">
              View Volunteers
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
