import { useEffect, useState } from 'react'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { storeAPI } from '../services/apiClient'

export default function CustomerProfileScreen() {
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false

        const loadProfile = async () => {
            try {
                setLoading(true)
                const response = await storeAPI.getProfile()
                if (ignore) return
                setProfile(response.data || { name: '', email: '', phone: '', address: '' })
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Failed to load profile')
                }
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadProfile()

        return () => {
            ignore = true
        }
    }, [])

    const onChange = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }))
    }

    const onSave = async () => {
        try {
            setSaving(true)
            setError('')
            setMessage('')

            const response = await storeAPI.updateProfile({
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
            })

            setProfile(response.data || profile)
            setMessage('Profile updated successfully.')
        } catch (err) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <CustomerHomeLayout>
            <section className="max-w-3xl space-y-6">
                <PageHeader
                    eyebrow="Account"
                    title="Profile"
                    subtitle="Keep your contact and billing details up to date."
                />

                {error ? <Alert variant="error">{error}</Alert> : null}
                {message ? <Alert variant="success">{message}</Alert> : null}

                <Card className="space-y-5 p-5 sm:p-6">
                    {loading ? (
                        <p className="text-sm text-on-surface-variant">Loading profile...</p>
                    ) : (
                        <>
                            <Field label="User Name" required>
                                <Input value={profile.name || ''} onChange={(e) => onChange('name', e.target.value)} />
                            </Field>

                            <Field label="Email" required>
                                <Input type="email" value={profile.email || ''} onChange={(e) => onChange('email', e.target.value)} />
                            </Field>

                            <Field label="Phone Number">
                                <Input value={profile.phone || ''} onChange={(e) => onChange('phone', e.target.value)} />
                            </Field>

                            <Field label="Address">
                                <Textarea rows={3} value={profile.address || ''} onChange={(e) => onChange('address', e.target.value)} />
                            </Field>

                            <div className="pt-2">
                                <Button type="button" onClick={onSave} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            </section>
        </CustomerHomeLayout>
    )
}
