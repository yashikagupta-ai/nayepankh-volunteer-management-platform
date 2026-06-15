import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { volunteerAPI } from '../services/api'

const SKILLS_OPTIONS = [
  'Teaching/Tutoring', 'Graphic Design', 'Web Development', 'Photography',
  'Video Editing', 'Social Media', 'Event Management', 'Content Writing',
  'Public Speaking', 'Medical/Healthcare', 'Cooking/Food', 'Fundraising',
  'Legal Aid', 'Music/Arts', 'Driving/Logistics', 'Data Entry',
]

const INTERESTS_OPTIONS = [
  'Education & Literacy', 'Women Empowerment', 'Child Welfare', 'Healthcare',
  'Food Distribution', 'Environment', 'Animal Welfare', 'Senior Citizens',
  'Disability Support', 'Disaster Relief', 'Rural Development', 'Mental Health',
]

const AVAILABILITY_OPTIONS = [
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)', icon: '📅' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)', icon: '🗓️' },
  { value: 'both', label: 'Both Weekdays & Weekends', icon: '📆' },
  { value: 'flexible', label: 'Flexible / On-Demand', icon: '🔄' },
]

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  skills: [],
  interests: [],
  availability: '',
}

function MultiSelect({ options, selected, onChange, label, id }) {
  const toggle = (value) => {
    onChange(selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value])
  }

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              id={`${id}-${opt.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => toggle(opt)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium ${
                isSelected
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white/5 border-white/15 text-gray-300 hover:border-orange-500/50 hover:text-orange-300'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-orange-400 mt-2">{selected.length} selected</p>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSkills = (val) => setForm((prev) => ({ ...prev, skills: val }))
  const handleInterests = (val) => setForm((prev) => ({ ...prev, interests: val }))

  const validateStep1 = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      return 'Please enter your full name (at least 2 characters).'
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return 'Please enter a valid email address.'
    if (!/^[6-9]\d{9}$/.test(form.phone))
      return 'Please enter a valid 10-digit Indian mobile number.'
    if (!form.city.trim())
      return 'Please enter your city.'
    return ''
  }

  const validateStep2 = () => {
    if (!form.availability)
      return 'Please select your availability.'
    return ''
  }

  const goNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    try {
      const res = await volunteerAPI.register(form)
      // Navigate to dashboard with success state
      navigate('/dashboard', {
        state: { newVolunteer: res.data.data, success: true },
      })
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="badge mb-4">Join the Movement</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Volunteer <span className="text-gradient">Registration</span>
          </h1>
          <p className="text-gray-400">
            Complete your profile and become part of the NayePankh family.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`flex items-center gap-3`}>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= s
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white/10 text-gray-400 border border-white/20'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block transition-colors duration-300 ${
                    step >= s ? 'text-orange-400' : 'text-gray-500'
                  }`}
                >
                  {s === 1 ? 'Personal Details' : 'Skills & Availability'}
                </span>
              </div>
              {s < 2 && (
                <div className={`w-16 h-0.5 transition-all duration-500 ${step > s ? 'bg-orange-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
            <span className="mt-0.5 flex-shrink-0">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1 ─────────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="form-label">
                      Full Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Rahul Sharma"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="text-orange-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="rahul@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="form-label">
                      Phone Number <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        +91
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="form-input pl-14"
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">10-digit Indian mobile number</p>
                  </div>

                  <div>
                    <label htmlFor="city" className="form-label">
                      City <span className="text-orange-500">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Lucknow"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  id="step1-next-btn"
                  onClick={goNext}
                  className="btn-primary w-full py-4 text-base mt-2"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── STEP 2 ─────────────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <MultiSelect
                  id="skills"
                  label="Your Skills (select all that apply)"
                  options={SKILLS_OPTIONS}
                  selected={form.skills}
                  onChange={handleSkills}
                />

                <MultiSelect
                  id="interests"
                  label="Areas of Interest (select all that apply)"
                  options={INTERESTS_OPTIONS}
                  selected={form.interests}
                  onChange={handleInterests}
                />

                {/* Availability */}
                <div>
                  <label className="form-label">
                    Availability <span className="text-orange-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABILITY_OPTIONS.map(({ value, label, icon }) => (
                      <label
                        key={value}
                        htmlFor={`availability-${value}`}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          form.availability === value
                            ? 'bg-orange-500/15 border-orange-500/60 text-white'
                            : 'bg-white/3 border-white/10 text-gray-300 hover:border-orange-500/30 hover:text-white'
                        }`}
                      >
                        <input
                          type="radio"
                          id={`availability-${value}`}
                          name="availability"
                          value={value}
                          checked={form.availability === value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-xl">{icon}</span>
                        <div>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <div
                          className={`ml-auto w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                            form.availability === value
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-white/30'
                          }`}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    id="step2-back-btn"
                    onClick={() => { setStep(1); setError('') }}
                    className="btn-secondary flex-1 py-4 text-base"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    id="submit-registration-btn"
                    disabled={loading}
                    className="btn-primary flex-1 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      '🎉 Complete Registration'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          {['🔒 Secure & Private', '📋 UP Govt. Registered', '⚡ Instant Registration'].map((txt) => (
            <span key={txt} className="text-gray-500 text-xs flex items-center gap-1.5">
              {txt}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
