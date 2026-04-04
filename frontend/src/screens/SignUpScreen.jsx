import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function SignUpScreen({
    audience = 'customer',
    title,
    description,
    highlights,
    appLabel,
    heading,
    subheading,
    loginPath = '/login',
    loginLabel = 'Sign in',
    loginPrompt = 'Already have an account?',
    postSignupPath = '/customer/home',
}) {
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
            navigate(postSignupPath, { replace: true })
        } catch (err) {
            setError(err.message || 'Sign up failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (audience === 'internal') {
        return (
            <AuthLayout
                title={title || 'Internal access by invitation.'}
                description={description || 'Internal accounts are provisioned by an administrator and are not self-registered.'}
                highlights={highlights || [
                    { title: 'Invitation only', description: 'Employees receive access from internal administrators.' },
                    { title: 'Separated portals', description: 'Internal accounts stay isolated from customer sign-ups.' },
                ]}
            >
                <Card className="mx-auto w-full max-w-[520px] p-6 sm:p-8 lg:p-10 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">{appLabel || 'SubSync Internal'}</p>
                    <h2 className="mt-3 font-serif text-3xl font-bold text-primary">{heading || 'Request internal access'}</h2>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        {subheading || 'If you are part of the internal team, ask an administrator to create your account.'}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            to={loginPath}
                            className="inline-flex items-center justify-center rounded-full bg-surface-container-high px-5 py-3 font-semibold text-on-surface transition hover:bg-surface-container-highest sm:flex-1"
                        >
                            {loginLabel}
                        </Link>
                    </div>
                </Card>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title={title || 'Master your subscriptions with editorial precision.'}
            description={description || 'Create a customer account to manage subscriptions and billing with a clean workspace that stays approachable on every screen size.'}
            highlights={highlights || [
                { title: 'Readable forms', description: 'Clear grouping, labels, and focus states reduce friction while entering data.' },
                { title: 'Consistent spacing', description: 'Reusable components keep forms and dashboards visually aligned.' },
            ]}
        >
            <Card className="mx-auto w-full max-w-[520px] p-6 sm:p-8 lg:p-10">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">{appLabel || 'SubSync'}</p>
                    <h2 className="mt-3 font-serif text-3xl font-bold text-primary">{heading || 'Create account'}</h2>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{subheading || 'Start managing subscriptions today.'}</p>
                </div>

                {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="First name" required>
                            <Input
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Julian"
                                autoComplete="given-name"
                                required
                                disabled={loading}
                            />
                        </Field>
                        <Field label="Last name" required>
                            <Input
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Thorne"
                                autoComplete="family-name"
                                required
                                disabled={loading}
                            />
                        </Field>
                    </div>

                    <Field label="Email" required>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="julian@company.com"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </Field>

                    <Field id="signup-password" label="Password" required>
                        <div className="relative">
                            <Input
                                id="signup-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
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

                    <Field id="signup-confirm-password" label="Confirm password" required>
                        <Input
                            id="signup-confirm-password"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            disabled={loading}
                        />
                    </Field>

                    <Button type="submit" block size="lg" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>

                <footer className="mt-8 border-t border-surface-container pt-6 text-center">
                    <p className="text-sm text-on-surface-variant">
                        {loginPrompt}{' '}
                        <Link to={loginPath} className="font-semibold text-primary underline-offset-4 hover:underline">
                            {loginLabel}
                        </Link>
                    </p>
                </footer>
            </Card>
        </AuthLayout>
    )
}
