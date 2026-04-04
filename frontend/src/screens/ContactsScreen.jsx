import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { usersAPI } from '../services/apiClient'

export default function ContactsScreen() {
    const navigate = useNavigate()
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [query, setQuery] = useState('')
    const [selectedContactId, setSelectedContactId] = useState(null)
    const [addresses, setAddresses] = useState([])
    const [loadingAddresses, setLoadingAddresses] = useState(false)
    const [creatingAddress, setCreatingAddress] = useState(false)
    const [addressForm, setAddressForm] = useState({
        address_type: 'billing',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_primary: false,
    })

    const loadContacts = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await usersAPI.getAll()
            const users = Array.isArray(response.data) ? response.data : []
            setContacts(users)

            if (!selectedContactId && users.length) {
                setSelectedContactId(users[0].id)
            }
        } catch (err) {
            setError(err.message || 'Failed to load contacts')
        } finally {
            setLoading(false)
        }
    }

    const loadAddresses = async (userId) => {
        if (!userId) {
            setAddresses([])
            return
        }

        try {
            setLoadingAddresses(true)
            setError('')
            const response = await usersAPI.getAddresses(userId)
            setAddresses(Array.isArray(response.data) ? response.data : [])
        } catch (err) {
            setError(err.message || 'Failed to load contact addresses')
        } finally {
            setLoadingAddresses(false)
        }
    }

    useEffect(() => {
        loadContacts()
    }, [])

    useEffect(() => {
        if (selectedContactId) {
            loadAddresses(selectedContactId)
        }
    }, [selectedContactId])

    const filteredContacts = useMemo(() => {
        const text = query.trim().toLowerCase()
        if (!text) return contacts

        return contacts.filter((contact) => {
            const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase()
            const email = String(contact.email || '').toLowerCase()
            return fullName.includes(text) || email.includes(text)
        })
    }, [contacts, query])

    const selectedContact = useMemo(
        () => contacts.find((contact) => contact.id === selectedContactId) || null,
        [contacts, selectedContactId],
    )

    const onCreateAddress = async (event) => {
        event.preventDefault()
        if (!selectedContactId) {
            setError('Please select a contact first')
            return
        }

        try {
            setCreatingAddress(true)
            setError('')
            await usersAPI.addAddress(selectedContactId, addressForm)
            setAddressForm({
                address_type: 'billing',
                street: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
                is_primary: false,
            })
            await loadAddresses(selectedContactId)
        } catch (err) {
            setError(err.message || 'Failed to create address')
        } finally {
            setCreatingAddress(false)
        }
    }

    return (
        <ProtectedAppPage
            current="contacts"
            title="Customer Contacts"
            subtitle="Manage end-user contacts and their address records"
            maxWidth="max-w-7xl"
            actions={<button type="button" onClick={loadContacts} className="rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-semibold">Refresh</button>}
        >
            {error ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            {loading ? (
                <div className="rounded-[1.5rem] border border-dashed border-outline-variant bg-white/70 py-12 text-center text-sm text-on-surface-variant">
                    Loading contacts...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <section className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(27,45,79,0.08)]">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search contact name or email"
                            className="mb-4 w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />

                        <div className="max-h-[480px] space-y-2 overflow-y-auto">
                            {filteredContacts.length === 0 ? (
                                <p className="text-sm text-on-surface-variant">No contacts found.</p>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <button
                                        key={contact.id}
                                        type="button"
                                        onClick={() => setSelectedContactId(contact.id)}
                                        className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${selectedContactId === contact.id ? 'border-primary bg-surface-container-low' : 'border-outline-variant bg-white hover:border-primary/30'}`}
                                    >
                                        <p className="font-semibold text-on-surface">{contact.first_name} {contact.last_name}</p>
                                        <p className="text-xs text-on-surface-variant">{contact.email}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="lg:col-span-2 space-y-4">
                        {!selectedContact ? (
                            <div className="rounded-[1.5rem] border border-dashed border-outline-variant bg-white/70 py-12 text-center text-sm text-on-surface-variant">
                                Select a contact to view details.
                            </div>
                        ) : (
                            <>
                                <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(27,45,79,0.08)]">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold text-primary">{selectedContact.first_name} {selectedContact.last_name}</h3>
                                            <p className="text-sm text-on-surface-variant">{selectedContact.email}</p>
                                            <p className="text-sm text-on-surface-variant">{selectedContact.phone || 'No phone number'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/users/detail?id=${selectedContact.id}`)}
                                            className="rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm font-semibold"
                                        >
                                            Open User Profile
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(27,45,79,0.08)]">
                                    <h4 className="mb-3 text-lg font-semibold text-primary">Addresses</h4>
                                    {loadingAddresses ? (
                                        <p className="text-sm text-on-surface-variant">Loading addresses...</p>
                                    ) : addresses.length === 0 ? (
                                        <p className="text-sm text-on-surface-variant">No addresses for this contact yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {addresses.map((address) => (
                                                <div key={address.id} className="rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm">
                                                    <p className="font-semibold capitalize">{address.address_type}</p>
                                                    <p>{address.street || 'No street'}</p>
                                                    <p className="text-on-surface-variant">{[address.city, address.state, address.postal_code, address.country].filter(Boolean).join(', ') || 'No city/state/country'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={onCreateAddress} className="rounded-[1.5rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(27,45,79,0.08)]">
                                    <h4 className="mb-4 text-lg font-semibold text-primary">Add Address</h4>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <select
                                            value={addressForm.address_type}
                                            onChange={(e) => setAddressForm((prev) => ({ ...prev, address_type: e.target.value }))}
                                            className="rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm"
                                        >
                                            <option value="billing">Billing</option>
                                            <option value="shipping">Shipping</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={addressForm.street}
                                            onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))}
                                            placeholder="Street"
                                            className="rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                                            placeholder="City"
                                            className="rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                                            placeholder="State"
                                            className="rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={addressForm.postal_code}
                                            onChange={(e) => setAddressForm((prev) => ({ ...prev, postal_code: e.target.value }))}
                                            placeholder="Postal Code"
                                            className="rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={addressForm.country}
                                            onChange={(e) => setAddressForm((prev) => ({ ...prev, country: e.target.value }))}
                                            placeholder="Country"
                                            className="rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm"
                                        />
                                    </div>
                                    <label className="mt-3 flex items-center gap-2 text-sm text-on-surface">
                                        <input
                                            type="checkbox"
                                            checked={addressForm.is_primary}
                                            onChange={(e) => setAddressForm((prev) => ({ ...prev, is_primary: e.target.checked }))}
                                        />
                                        Mark as primary
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={creatingAddress}
                                        className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        {creatingAddress ? 'Saving...' : 'Save Address'}
                                    </button>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            )}
        </ProtectedAppPage>
    )
}
