import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'

const SUGGESTED_QUESTIONS = [
  'How can I volunteer?',
  'Which internship is best for me?',
  'What programs does NayePankh run?',
]

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am Pankh 🪶, your NayePankh AI Assistant. How can I help you support underprivileged communities or join our mission today? 🌟',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)

  const messagesEndRef = useRef(null)

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setHasUnread(false)
    }
  }, [messages, isOpen])

  // Clear Chat History
  const handleClearHistory = () => {
    if (window.confirm('Clear your conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: 'History cleared. How else can I assist you with NayePankh Foundation today? 🌟',
          timestamp: new Date(),
        },
      ])
    }
  }

  // Handle Send Message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim()) return

    // Clear input
    if (!textToSend) setInput('')

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      // Map message history to schema expected by backend controller
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }))

      // Send to backend
      const res = await chatAPI.sendMessage(text, historyPayload)

      if (res.data.success && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'model',
            text: res.data.reply,
            timestamp: new Date(),
          },
        ])
      } else {
        throw new Error('No reply content returned.')
      }
    } catch (err) {
      console.error('Chat error:', err)
      const errorText =
        err.friendlyMessage ||
        (err.response?.data?.message) ||
        'Could not reach AI services. Please verify the backend is running and the GEMINI_API_KEY is configured.'

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: `⚠️ Offline Error:\n${errorText}`,
          isError: true,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle suggested questions
  const handleSuggestedClick = (q) => {
    handleSendMessage(q)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Window ──────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] max-h-[85vh] bg-[#0E1422]/98 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col shadow-2xl shadow-black/80 overflow-hidden mb-4 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-rose-600 p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold text-lg">
                🪶
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm tracking-wide leading-none">Pankh — NayePankh AI</h3>
                <span className="text-[10px] text-orange-100 flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active Assistant
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearHistory}
                title="Clear History"
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs"
              >
                🧹
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize"
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900/40 custom-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-br-none shadow-md shadow-orange-500/10'
                      : m.isError
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-bl-none font-medium'
                      : 'bg-white/5 border border-white/5 text-gray-200 rounded-bl-none shadow-sm shadow-black/20'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce-delay-1" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce-delay-2" />
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce-delay-3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Panel */}
          {messages.length === 1 && !isTyping && (
            <div className="p-3 border-t border-white/5 bg-[#0A0E18]/60 space-y-1.5">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">Suggested Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestedClick(q)}
                    className="text-xs text-left px-3 py-1.5 rounded-xl border border-white/5 bg-white/3 hover:bg-orange-500/10 hover:border-orange-500/30 text-gray-300 hover:text-orange-400 transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 border-t border-white/5 bg-[#0B0F19] flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTyping ? 'Generating response...' : 'Ask Pankh about NayePankh...'}
              disabled={isTyping}
              className="flex-1 text-xs h-9 bg-white/5 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50 placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-1"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* ── Toggle Button ────────────────────────────────────────────────────── */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setHasUnread(false)
        }}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white text-2xl shadow-xl hover-lift transition-all duration-300 relative ${
          isOpen ? 'rotate-90' : ''
        }`}
        title="Chat with Assistant"
      >
        {isOpen ? '✕' : '💬'}

        {/* Pulsing notification badge */}
        {!isOpen && hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-[#090D16] text-[8px] font-bold items-center justify-center">
              1
            </span>
          </span>
        )}
      </button>
    </div>
  )
}
