import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignUpScreen() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { register } = useAuth()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!formData.first_name || !formData.last_name) {
            setError('First and last name are required')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
            })
            navigate('/home', { replace: true })
        } catch (err) {
            setError(err.message || 'Sign up failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-surface-container-low flex font-body text-on-surface">
            {/* Left Section: Aesthetic/Pattern */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden p-20">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#031839 0.5px, transparent 0.5px), radial-gradient(#031839 0.5px, #fbf9f5 0.5px)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>
                <div className="absolute inset-0 opacity-[0.05]" style={{ background: 'linear-gradient(90deg, rgba(3, 24, 57, 0.05) 1px, transparent 1px) 0 0 / 50px 50px, linear-gradient(rgba(3, 24, 57, 0.05) 1px, transparent 1px) 0 0 / 50px 50px' }}></div>
                
                <div className="relative z-10 text-left max-w-xl">
                    <h2 className="font-headline text-5xl font-bold text-primary leading-tight mb-6 italic">Master your subscriptions with editorial precision.</h2>
                    <p className="text-on-surface-variant text-lg tracking-tight leading-relaxed">Join the curated ledger for modern business finance. Experience transparency like never before.</p>
                    <div className="mt-16 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            </div>
                            <span className="font-label text-sm uppercase tracking-widest text-primary font-bold">Automated Auditing</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                            </div>
                            <span className="font-label text-sm uppercase tracking-widest text-primary font-bold">Cost Forecasting</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section: Auth Card */}
            <main className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl p-10 shadow-[0_10px_40px_rgba(27,45,79,0.05)] border border-primary/5 transition-all duration-200">
                    {/* Logo & Header */}
                    <header className="mb-10">
                        <div className="flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
                            <span className="font-headline text-2xl font-bold text-primary tracking-tight">SubSync</span>
                        </div>
                        <h1 className="font-headline text-3xl font-bold text-primary leading-tight">Create account</h1>
                        <p className="font-body text-on-surface-variant text-sm mt-2">Start managing subscriptions today</p>
                    </header>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm border border-error/10">
                            {error}
                        </div>
                    )}

                    {/* Sign Up Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2" htmlFor="first_name">First Name</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Julian"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2" htmlFor="last_name">Last Name</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Thorne"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="julian@company.com"
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 outline-none pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                             <label className="block font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2" htmlFor="confirmPassword">Confirm Password</label>
                             <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-4 shadow-sm"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <footer className="mt-8 text-center border-t border-surface-container pt-8">
                        <p className="font-body text-sm text-on-surface-variant">
                            Already have an account?
                            <Link to="/login" className="text-tertiary-fixed-dim font-bold hover:underline transition-all underline-offset-4 ml-1">Sign in</Link>
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
