import { useState, useEffect, useRef } from 'react'
import { intakeAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STEP_LABELS = [
  { step: 1, label: 'Name Collection', icon: '👤' },
  { step: 2, label: 'Education Details', icon: '🎓' },
  { step: 3, label: 'Skills & Expertise', icon: '💡' },
  { step: 4, label: 'Interests & Causes', icon: '🎯' },
  { step: 5, label: 'NGO Recommendations', icon: '🌟' },
  { step: 6, label: 'Intake Summary', icon: '📄' },
]

export default function IntakeAgentPage() {
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const messagesEndRef = useRef(null)

  // Scroll to bottom on history change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load or initialize intake session
  const fetchSession = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const res = await intakeAPI.getSession()
      if (res.data.success) {
        setSession(res.data.data)
        setMessages(res.data.data.chatHistory || [])
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to initialize intake session.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, isTyping])

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const text = input
    setInput('')

    // Optimistically add user message to UI
    const tempUserMsg = {
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setIsTyping(true)

    try {
      const res = await intakeAPI.sendMessage(text)
      if (res.data.success) {
        setSession(res.data.data)
        setMessages(res.data.data.chatHistory || [])
      }
    } catch (err) {
      console.error(err)
      const errMsg = err.friendlyMessage || 'Connection error. Please try again.'
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ Error: ${errMsg}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // Reset Session
  const handleResetSession = async () => {
    if (window.confirm('Are you sure you want to restart your intake interview? This will clear all progress.')) {
      try {
        setLoading(true)
        const res = await intakeAPI.resetSession()
        if (res.data.success) {
          setSession(res.data.data)
          setMessages(res.data.data.chatHistory || [])
          setError('')
        }
      } catch (err) {
        setError('Failed to reset session.')
      } finally {
        setLoading(false)
      }
    }
  }

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (session?.summary) {
      navigator.clipboard.writeText(session.summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-semibold">Initializing AI Volunteer Agent...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-dark-900 px-4">
        <div className="max-w-md w-full glass-card p-8 text-center border-red-500/20">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-white font-extrabold text-xl mb-2">Initialization Failed</h3>
          <p className="text-red-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              setError('')
              fetchSession()
            }}
            className="btn-primary w-full"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  const currentStep = session?.currentStep || 1
  const profile = session?.profile || {}

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-dark-900 relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 50% 40% at 50% 0%, rgba(249,115,22,0.05) 0%, transparent 60%)`,
      }} />

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* ── Left Panel: Live Stepper & Profile build ─────────────────────────── */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6 flex-shrink-0">
          
          {/* Stepper progress */}
          <div className="glass-card p-6 border-white/5 bg-white/[0.01]">
            <h3 className="text-white font-extrabold text-lg mb-4 flex items-center gap-2">
              <span>🤖</span> Intake Workflow
            </h3>
            
            <div className="space-y-3">
              {STEP_LABELS.map((s) => {
                const isActive = currentStep === s.step
                const isCompleted = currentStep > s.step || session?.isCompleted
                
                return (
                  <div
                    key={s.step}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-sm'
                        : isCompleted
                        ? 'border-green-500/20 bg-green-500/5 text-green-400'
                        : 'border-white/5 bg-transparent text-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      isActive
                        ? 'bg-orange-500 text-white font-bold'
                        : isCompleted
                        ? 'bg-green-500/20 text-green-400 font-bold'
                        : 'bg-white/5 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : s.icon}
                    </div>
                    <span className="text-xs font-semibold">{s.label}</span>
                    {isActive && (
                      <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Live Profile Build Card */}
          <div className="glass-card p-6 border-white/5 bg-white/[0.01] flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                  <span>📝</span> Live Profile Build
                </h3>
                <span className="text-[10px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded text-gray-400 font-semibold uppercase tracking-wider">
                  Real-time
                </span>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Volunteer Name</p>
                  <p className={`text-sm font-semibold ${profile.name ? 'text-white' : 'text-gray-600 italic text-xs'}`}>
                    {profile.name || 'Awaiting input...'}
                  </p>
                </div>

                {/* Education */}
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Education Background</p>
                  <p className={`text-sm font-semibold ${profile.education ? 'text-white' : 'text-gray-600 italic text-xs'}`}>
                    {profile.education || 'Awaiting input...'}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">Expertise / Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-400 font-semibold">
                          💡 {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600 italic text-xs">Awaiting input...</p>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">Interests & Causes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-semibold">
                          🎯 {i}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600 italic text-xs">Awaiting input...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reset option */}
            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
              <button
                onClick={handleResetSession}
                className="w-full text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/5 border border-white/5 hover:border-red-500/20 py-2.5 rounded-xl transition-all duration-200 font-bold"
              >
                🔄 Restart Intake
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Conversational Chat interface ─────────────────────────── */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Chat main wrapper */}
          <div className="glass-card flex-1 min-h-[500px] flex flex-col border-white/5 bg-[#0E1422]/98 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#0F1524] p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-500/10 animate-pulse-slow">
                  🪶
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-none">Pankh — AI Intake Agent</h3>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Intake Interview
                  </span>
                </div>
              </div>
            </div>

            {/* Chat History Panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[380px] custom-scrollbar bg-dark-900/10">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-br-none shadow-md shadow-orange-500/10'
                        : 'bg-white/5 border border-white/5 text-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1">
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce-delay-1" />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce-delay-2" />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce-delay-3" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-white/5 bg-[#0B0F19] flex gap-3 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  session?.isCompleted
                    ? 'Intake completed successfully! You can review details below.'
                    : isTyping
                    ? 'Agent is thinking...'
                    : 'Respond to Pankh...'
                }
                disabled={isTyping || session?.isCompleted}
                className="flex-1 text-xs h-10 bg-white/5 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-40 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim() || session?.isCompleted}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1"
              >
                Send
              </button>
            </form>
          </div>

          {/* ── Recommendations and summary view on Step 5 / 6 ───────────────────── */}
          {session?.recommendations && session.recommendations.length > 0 && (
            <div className="space-y-6 animate-fade-in">
              {/* Recommendations Card */}
              <div className="glass-card p-6 border-white/5">
                <h3 className="text-white font-extrabold text-lg mb-4 flex items-center gap-2">
                  <span>🌟</span> Recommended Programs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col justify-between hover:border-orange-500/20 transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-sm leading-snug">{rec.programName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                            {rec.suitabilityScore}% Match
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed mb-3">{rec.description}</p>
                      </div>
                      <div className="text-[11px] bg-white/5 rounded-lg p-2.5 border border-white/5 text-gray-300 italic">
                        <strong>Match Rationale:</strong> {rec.whyRecommended}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Profile Card (Step 6) */}
              {session.summary && (
                <div className="glass-card p-6 border-white/5 bg-gradient-to-r from-orange-500/5 to-rose-500/5 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                      <span>📄</span> Volunteer Intake Summary
                    </h3>
                    <button
                      onClick={handleCopySummary}
                      className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-orange-500/20 text-gray-300 px-3 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1 font-semibold"
                    >
                      {copied ? '✓ Copied!' : '📋 Copy Summary'}
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-dark-900/60 p-4 rounded-xl border border-white/5">
                    {session.summary}
                  </p>
                  <div className="mt-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 p-3.5 rounded-xl">
                    <span className="text-lg">🎉</span>
                    <p className="text-green-400 text-xs font-semibold">
                      Profile successfully generated! The NayePankh team will review your credentials and contact you shortly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
