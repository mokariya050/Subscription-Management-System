import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/apiClient'
import AuthLayout from '../components/layout/AuthLayout'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [devOtp, setDevOtp] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSuccessMessage('')
        setDevOtp('')
        setLoading(true)

        try {
            const data = await authAPI.forgotPassword(email)
            setSuccessMessage('If this account exists, an OTP has been sent. It expires in 10 minutes.')
            setDevOtp(data?.otp || '')
        } catch (err) {
            setError(err.message || 'Unable to send OTP right now. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Recover access quickly and securely."
            description="Request a one-time passcode, then set a new password in a guided flow."
            highlights={[
                { title: 'Time-bound OTP', description: 'Each OTP expires quickly and can only be used once.' },
                { title: 'Clear steps', description: 'Request code, verify code, and set a new password.' },
            ]}
        >
            <Card className="mx-auto w-full max-w-[460px] p-6 sm:p-8 lg:p-10">
                <div className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">Forgot password</p>
                    <h2 className="mt-3 font-serif text-3xl font-bold text-primary">Request OTP</h2>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">Enter your account email to receive a one-time code.</p>
                </div>

                {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}
                {successMessage ? <Alert className="mb-6">{successMessage}</Alert> : null}
                {devOtp ? (
                    <Alert className="mb-6">
                        Development OTP: <span className="font-semibold">{devOtp}</span>
                    </Alert>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Field label="Email address" required>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </Field>

                    <Button type="submit" block size="lg" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>

                    {successMessage ? (
                        <Link
                            to={`/reset-password?email=${encodeURIComponent(email)}`}
                            className="block w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-center text-sm font-semibold text-primary transition hover:border-primary"
                        >
                            Continue to reset password
                        </Link>
                    ) : null}
                </form>

                <div className="mt-8 border-t border-surface-container pt-6 text-center">
                    <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" to="/login">
                        Back to sign in
                    </Link>
                </div>
            </Card>
        </AuthLayout>
    )
}
