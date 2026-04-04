import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

const defaultHighlights = [
    { title: 'Accessible by default', description: 'Keyboard-friendly controls, clear contrast, and visible focus states across the app.' },
    { title: 'Reusable components', description: 'Shared layout and form primitives keep screens consistent and easier to maintain.' },
]

export default function LoginScreen({
    audience = 'customer',
    title,
    description,
    highlights,
    appLabel,
    heading,
    subheading,
    forgotPasswordPath = '/forgot-password',
    signUpPath = '/signup',
    signUpLabel = 'Create one',
    signUpPrompt = "Don't have an account?",
    postLoginPath = '/customer/home',
    showDemoCredentials = true,
    demoCredentials = ['Customer: customer@acme.com / password123'],
}) {
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
            navigate(postLoginPath, { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title={title || (audience === 'internal' ? 'Internal access for employees.' : 'Managing clarity in a world of complexity.')}
            description={description || (audience === 'internal'
                ? 'Sign in to the internal workspace used by admins and employees.'
                : 'SubSync streamlines customer access through a calm, editorial interface that keeps work readable and fast.')}
            highlights={highlights || (audience === 'internal'
                ? [
                    { title: 'Internal workspace', description: 'Separate access for staff and internal operations.' },
                    { title: 'Secure sign-in', description: 'Employee access is isolated from customer accounts.' },
                ]
                : defaultHighlights)}
        >
            <Card className="mx-auto w-full max-w-[480px] p-6 sm:p-8 lg:p-10">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">{appLabel || (audience === 'internal' ? 'SubSync Internal' : 'SubSync')}</p>
                    <h2 className="mt-3 font-serif text-3xl font-bold text-primary">{heading || (audience === 'internal' ? 'Internal sign in' : 'Welcome back')}</h2>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{subheading || (audience === 'internal' ? 'Use your employee credentials to continue.' : 'Sign in to continue to your dashboard.')}</p>
                </div>

                {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Field label="Email address" required>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </Field>

                    <Field
                        id="login-password"
                        label="Password"
                        required
                        hint={
                            <span className="flex items-center justify-between gap-4">
                                <span>Use your account password.</span>
                                <Link to={forgotPasswordPath} className="font-semibold text-primary underline-offset-4 hover:underline">
                                    Forgot password?
                                </Link>
                            </span>
                        }
                    >
                        <div className="relative">
                            <Input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                disabled={loading}
                                className="pr-24"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-sm font-semibold text-primary transition hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </Field>

                    <Button type="submit" block size="lg" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                <div className="mt-8 border-t border-surface-container pt-6 text-center">
                    {signUpPath ? (
                        <p className="text-sm text-on-surface-variant">
                            {signUpPrompt}{' '}
                            <Link to={signUpPath} className="font-semibold text-primary underline-offset-4 hover:underline">
                                {signUpLabel}
                            </Link>
                        </p>
                    ) : (
                        <p className="text-sm text-on-surface-variant">
                            Internal access is invitation-only. Contact an administrator if you need access.
                        </p>
                    )}
                </div>

                {showDemoCredentials && demoCredentials.length > 0 ? (
                    <div className="mt-6 rounded-2xl border border-secondary/20 bg-secondary-container px-4 py-4 text-sm text-on-secondary-container">
                        <p className="font-semibold text-primary">Demo credentials</p>
                        {demoCredentials.map((line) => (
                            <p key={line} className="mt-2 break-words">{line}</p>
                        ))}
                    </div>
                ) : null}
            </Card>
        </AuthLayout>
    )
}
