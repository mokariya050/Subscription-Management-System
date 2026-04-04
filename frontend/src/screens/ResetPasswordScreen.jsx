import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/apiClient'
import AuthLayout from '../components/layout/AuthLayout'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function ResetPasswordScreen({
  title,
  description,
  highlights,
  appLabel,
  heading,
  subheading,
  loginPath = '/login',
  forgotPath = '/forgot-password',
}) {

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const otpInputRefs = useRef([])
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpVerified, setOtpVerified] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [lastAutoVerifiedOtp, setLastAutoVerifiedOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits])

  useEffect(() => {
    const seededEmail = searchParams.get('email') || ''
    if (seededEmail) {
      setEmail(seededEmail)
    }
  }, [searchParams])

  useEffect(() => {
    if (otpVerified || verifyingOtp || otpValue.length !== 6) {
      return
    }

    if (!email || otpValue === lastAutoVerifiedOtp) {
      return
    }

    const autoVerify = async () => {
      setVerifyingOtp(true)
      setError('')
      try {
        await authAPI.verifyResetOtp({ email, otp: otpValue })
        setOtpVerified(true)
        setSuccessMessage('OTP verified. You can now set a new password.')
      } catch (err) {
        setError(err.message || 'Invalid OTP. Please try again.')
      } finally {
        setLastAutoVerifiedOtp(otpValue)
        setVerifyingOtp(false)
      }
    }

    autoVerify()
  }, [email, lastAutoVerifiedOtp, otpValue, otpVerified, verifyingOtp])

  const handleVerifyOtp = async (event) => {
    event?.preventDefault()
    if (!email || otpValue.length !== 6 || otpVerified) {
      return
    }

    setError('')
    setSuccessMessage('')
    setVerifyingOtp(true)
    try {
      await authAPI.verifyResetOtp({ email, otp: otpValue })
      setOtpVerified(true)
      setSuccessMessage('OTP verified. You can now set a new password.')
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleOtpChange = (index, nextValue) => {
    const digit = nextValue.replace(/\D/g, '').slice(-1)
    const nextDigits = [...otpDigits]
    nextDigits[index] = digit

    setOtpDigits(nextDigits)
    setOtpVerified(false)
    setSuccessMessage('')

    if (digit && index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      event.preventDefault()
      const nextDigits = [...otpDigits]
      nextDigits[index - 1] = ''
      setOtpDigits(nextDigits)
      otpInputRefs.current[index - 1]?.focus()
      setOtpVerified(false)
      setSuccessMessage('')
      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      otpInputRefs.current[index - 1]?.focus()
      return
    }

    if (event.key === 'ArrowRight' && index < otpInputRefs.current.length - 1) {
      event.preventDefault()
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) {
      return
    }

    const nextDigits = ['', '', '', '', '', '']
    pasted.split('').forEach((char, index) => {
      nextDigits[index] = char
    })
    setOtpDigits(nextDigits)
    setOtpVerified(false)
    setSuccessMessage('')

    const focusIndex = Math.min(pasted.length, 6) - 1
    if (focusIndex >= 0) {
      otpInputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!otpVerified) {
      setError('Please verify OTP before resetting your password.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await authAPI.resetPasswordWithOtp({
        email,
        otp: otpValue,
        new_password: newPassword,
      })

      setSuccessMessage('Password reset successful. Redirecting to sign in...')
      setTimeout(() => {
        navigate(loginPath, { replace: true })
      }, 1200)
    } catch (err) {
      setError(err.message || 'Unable to reset password. Please verify your OTP and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={title || 'Securely set a new password.'}
      description={description || 'Verify your one-time passcode first, then set a new password.'}
      highlights={highlights || [
        { title: 'Fast verification', description: 'A segmented 6-digit OTP input supports paste and quick auto-checks.' },
        { title: 'Secure handoff', description: 'Password reset is enabled only after OTP verification succeeds.' },
      ]}
    >
      <Card className="mx-auto w-full max-w-[460px] p-6 sm:p-8 lg:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">{appLabel || 'Reset password'}</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-primary">{heading || 'Verify OTP'}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {subheading || (otpVerified ? 'OTP verified. Set your new password below.' : 'Enter the 6-digit code sent to your email.')}
          </p>
        </div>

        {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}
        {successMessage ? <Alert className="mb-6">{successMessage}</Alert> : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Email address" required>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setOtpVerified(false)
                setSuccessMessage('')
              }}
              autoComplete="email"
              required
              disabled={loading || verifyingOtp || otpVerified}
            />
          </Field>

          <Field label="One-time passcode" required hint="Type or paste your 6-digit OTP.">
            <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={`otp-digit-${index}`}
                  ref={(element) => {
                    otpInputRefs.current[index] = element
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  disabled={loading || verifyingOtp || otpVerified}
                  className="h-12 w-full rounded-2xl border border-outline-variant bg-white text-center text-xl font-semibold text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 sm:h-14"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
          </Field>

          {!otpVerified ? (
            <Button
              type="button"
              block
              size="lg"
              onClick={handleVerifyOtp}
              disabled={loading || verifyingOtp || otpValue.length !== 6 || !email}
            >
              {verifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
            </Button>
          ) : null}

          {otpVerified ? (
            <>
              <Field label="New password" required hint="Minimum 8 characters.">
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Field label="Confirm new password" required>
                <Input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>

              <Button type="submit" block size="lg" disabled={loading}>
                {loading ? 'Resetting password...' : 'Reset password'}
              </Button>
            </>
          ) : null}
        </form>

        <div className="mt-8 border-t border-surface-container pt-6 text-center">
          <p className="mb-2 text-sm text-on-surface-variant">
            Need a new OTP?{' '}
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" to={forgotPath}>
              Request again
            </Link>
          </p>
          <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" to={loginPath}>
            Back to sign in
          </Link>
        </div>
      </Card>
    </AuthLayout>
  )
}
