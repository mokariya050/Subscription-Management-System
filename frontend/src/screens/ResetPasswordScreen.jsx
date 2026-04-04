import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ResetPasswordScreen() {
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setEmailSent(true)
  }

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center font-body text-on-surface">
      <main className="flex flex-col md:flex-row w-full min-h-screen relative">
        {/* Left Section: Geometric Pattern */}
        <section className="hidden md:flex md:w-1/2 bg-surface items-center justify-center relative overflow-hidden p-12">
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line stroke="#031839" strokeWidth="0.1" x1="10" x2="90" y1="0" y2="100"></line>
            <line stroke="#031839" strokeWidth="0.1" x1="0" x2="100" y1="20" y2="80"></line>
            <line stroke="#031839" strokeWidth="0.1" x1="30" x2="30" y1="0" y2="100"></line>
            <circle cx="70" cy="30" fill="none" r="15" stroke="#031839" strokeWidth="0.1"></circle>
            <rect fill="none" height="20" stroke="#031839" strokeWidth="0.1" width="40" x="10" y="60"></rect>
          </svg>
          <div className="relative z-10 max-w-lg">
            <span className="text-xs uppercase tracking-widest font-label font-extrabold text-primary mb-4 block">SubSync Ledger</span>
            <h2 className="text-5xl font-serif text-primary leading-tight mb-6 italic">Financial clarity through intentional design.</h2>
            <p className="text-on-surface-variant font-body leading-relaxed">Secure your subscription data with industry-leading encryption and a clean, editorial approach to asset management.</p>
          </div>
        </section>

        {/* Right Section: Auth Cards */}
        <section className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 space-y-12 relative overflow-hidden">
           {/* Mobile background decor */}
           <div className="md:hidden absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#031839 1px, transparent 1px), linear-gradient(90deg, #031839 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          <div className="mb-4 flex flex-col items-center relative z-10">
            <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">SubSync</h1>
          </div>

          <div className="w-full max-w-[420px] bg-white p-10 rounded-xl shadow-[0_10px_40px_rgba(3,24,57,0.05)] border border-primary/5 relative z-10">
            {!emailSent ? (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-serif text-primary font-bold mb-2 italic">Reset password</h2>
                  <p className="text-on-surface-variant text-sm font-body">We'll send a reset link to your email</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                    <input
                      className="w-full px-4 py-3.5 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 text-on-surface font-body outline-none placeholder:text-slate-400"
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:opacity-95 active:scale-[0.99] transition-all duration-200 shadow-sm"
                    type="submit"
                  >
                    Send Reset Link
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                </div>
                <h2 className="text-3xl font-serif text-primary font-bold mb-2 italic">Check your inbox</h2>
                <p className="text-on-surface-variant text-sm font-body mb-8 leading-relaxed">
                  A reset link has been sent to <br/><span className="font-bold text-primary">{email}</span>
                </p>
                <button 
                   onClick={() => setEmailSent(false)}
                   className="w-full py-4 bg-surface-container-high text-primary font-bold rounded-lg hover:bg-surface-container-highest transition-all duration-200"
                >
                  Resend email
                </button>
              </div>
            )}
            
            <div className="mt-8 text-center border-t border-slate-50 pt-8">
              <Link className="text-sm font-semibold text-tertiary-fixed-dim hover:text-primary transition-all duration-200" to="/login">
                Back to Sign In
              </Link>
            </div>
          </div>

          <footer className="w-full max-w-[420px] flex justify-between px-2 relative z-10 opacity-30">
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">© 2024 SubSync Ledger</p>
            <div className="flex gap-4">
              <a className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline" href="#">Privacy</a>
              <a className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline" href="#">Terms</a>
            </div>
          </footer>
        </section>
      </main>
    </div>
  )
}
