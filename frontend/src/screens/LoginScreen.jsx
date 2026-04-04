import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
            navigate('/home', { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f3ef' }}>
            {/* Left side */}
            <div style={{ display: 'none', width: '50%', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: '48px' }} className="lg:flex">
                <div style={{ maxWidth: '600px' }}>
                    <div style={{ marginBottom: '32px', height: '1px', width: '96px', backgroundColor: 'rgba(3, 24, 57, 0.2)' }}></div>
                    <h2 style={{ fontSize: '48px', color: '#031839', marginBottom: '24px', fontFamily: 'serif', fontWeight: 'bold', lineHeight: '1.2' }}>
                        Managing clarity in a world of complexity.
                    </h2>
                    <p style={{ color: '#44474e', fontSize: '18px', lineHeight: '1.6' }}>
                        SubSync streamlines your corporate subscriptions through a refined editorial lens.
                    </p>
                </div>
            </div>

            {/* Right side */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 10px 40px rgba(27, 45, 79, 0.05)', border: '1px solid rgba(3, 24, 57, 0.05)' }}>
                        {/* Header */}
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#031839', marginBottom: '8px', fontFamily: 'serif' }}>SubSync</h1>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#031839', marginBottom: '8px', fontFamily: 'serif' }}>Welcome back</h2>
                        <p style={{ fontSize: '14px', color: '#44474e', marginBottom: '24px' }}>Sign in to your account</p>

                        {/* Error */}
                        {error && (
                            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px', color: '#c33', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
                            {/* Email */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#44474e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        backgroundColor: '#fff',
                                        color: '#1b1c1a',
                                        fontSize: '14px',
                                        outline: 'none',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#031839'; e.target.style.boxShadow = '0 0 0 2px rgba(3, 24, 57, 0.1)' }}
                                    onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#44474e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Password
                                    </label>
                                    <Link to="/reset-password" style={{ fontSize: '12px', fontWeight: '600', color: '#031839', textDecoration: 'underline' }}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '12px 40px 12px 16px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            backgroundColor: '#fff',
                                            color: '#1b1c1a',
                                            fontSize: '14px',
                                            outline: 'none',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = '#031839'; e.target.style.boxShadow = '0 0 0 2px rgba(3, 24, 57, 0.1)' }}
                                        onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#031839',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    backgroundColor: loading ? '#888' : '#031839',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1,
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#0a2e57' }}
                                onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#031839' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Sign up */}
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '24px', textAlign: 'center' }}>
                            <p style={{ color: '#44474e', fontSize: '14px' }}>
                                Don't have an account? {' '}
                                <Link to="/signup" style={{ color: '#031839', fontWeight: 'bold', textDecoration: 'underline' }}>
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* Demo */}
                        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f4f8', border: '1px solid #c4d4e8', borderRadius: '6px', fontSize: '13px', color: '#1b1c1a' }}>
                            <p style={{ fontWeight: 'bold', color: '#031839', marginBottom: '8px' }}>Demo Credentials:</p>
                            <p style={{ marginBottom: '4px' }}>Admin: <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>admin@acme.com</code></p>
                            <p style={{ marginBottom: '4px' }}>Customer: <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>customer@acme.com</code></p>
                            <p>Password: <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>password123</code></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
