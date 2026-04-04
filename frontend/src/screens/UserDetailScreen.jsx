import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { usersAPI } from '../services/apiClient'

export default function UserDetailScreen() {
    const { user: currentUser, logout, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const userId = searchParams.get('id')

    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    })
    const [createForm, setCreateForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'internal_user',
    })
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [creating, setCreating] = useState(false)
    const [selectedRole, setSelectedRole] = useState('')

    // Check auth loading
    useEffect(() => {
        if (authLoading) return
        if (!currentUser) {
            navigate('/login', { replace: true })
            return
        }
    }, [currentUser, authLoading, navigate])

    // Load users list
    useEffect(() => {
        if (!currentUser || authLoading) return

        const loadUsers = async () => {
            try {
                setLoadingUsers(true)
                const response = await usersAPI.getAll()
                setUsers(Array.isArray(response.data) ? response.data : [])
            } catch (err) {
                setError(err.message || 'Failed to load users')
            } finally {
                setLoadingUsers(false)
            }
        }

        loadUsers()
    }, [currentUser, authLoading])

    // Load selected user details
    useEffect(() => {
        if (!userId || !users.length) return

        const user = users.find(u => u.id === parseInt(userId))
        if (user) {
            setSelectedUser(user)
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
            })
        }
        setLoading(false)
    }, [userId, users])

    const handleUserSelect = (user) => {
        navigate(`/users/detail?id=${user.id}`)
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCreateInputChange = (field, value) => {
        setCreateForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSaveUser = async () => {
        if (!selectedUser) return
        try {
            setSaving(true)
            setError('')

            await usersAPI.update(selectedUser.id, formData)

            // Refresh users list
            const response = await usersAPI.getAll()
            setUsers(Array.isArray(response.data) ? response.data : [])

            alert('User updated successfully')
        } catch (err) {
            setError(err.message || 'Failed to update user')
        } finally {
            setSaving(false)
        }
    }

    const handleCreateUser = async () => {
        try {
            setCreating(true)
            setError('')

            // Validate required fields
            if (!createForm.email || !createForm.password || !createForm.first_name || !createForm.last_name) {
                setError('All fields are required')
                setCreating(false)
                return
            }

            await usersAPI.create(createForm)

            // Refresh users list
            const response = await usersAPI.getAll()
            setUsers(Array.isArray(response.data) ? response.data : [])

            // Reset form
            setCreateForm({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone: '',
                role: 'internal_user',
            })
            setShowCreateForm(false)
            alert('User created successfully')
        } catch (err) {
            setError(err.message || 'Failed to create user')
        } finally {
            setCreating(false)
        }
    }

    const handleDeactivateUser = async (user) => {
        if (!window.confirm(`Are you sure you want to deactivate ${user.first_name} ${user.last_name}?`)) {
            return
        }

        try {
            setSaving(true)
            setError('')

            await usersAPI.deactivateUser(user.id)

            // Refresh users list
            const response = await usersAPI.getAll()
            setUsers(Array.isArray(response.data) ? response.data : [])

            if (selectedUser?.id === user.id) {
                setSelectedUser(null)
                navigate('/users/detail')
            }

            alert('User deactivated successfully')
        } catch (err) {
            setError(err.message || 'Failed to deactivate user')
        } finally {
            setSaving(false)
        }
    }

    const handleAddRole = async (user, role) => {
        try {
            setSaving(true)
            setError('')

            await usersAPI.assignRole(user.id, role)

            // Refresh users list
            const response = await usersAPI.getAll()
            setUsers(Array.isArray(response.data) ? response.data : [])

            setSelectedRole('')
            alert(`Role ${role} assigned successfully`)
        } catch (err) {
            setError(err.message || 'Failed to assign role')
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveRole = async (roleId) => {
        if (!window.confirm('Are you sure you want to remove this role?')) {
            return
        }

        try {
            setSaving(true)
            setError('')

            await usersAPI.removeRole(roleId)

            // Refresh users list
            const response = await usersAPI.getAll()
            setUsers(Array.isArray(response.data) ? response.data : [])

            alert('Role removed successfully')
        } catch (err) {
            setError(err.message || 'Failed to remove role')
        } finally {
            setSaving(false)
        }
    }

    const onLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <ProtectedAppPage
            current="users"
            onLogout={onLogout}
            title="User Management"
            subtitle="Manage internal users, roles, and access"
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-[#e5e3df] p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Users</h3>
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="bg-[#1b2d4f] text-white px-3 py-1 rounded text-sm font-semibold hover:bg-[#0f1a2e]"
                            >
                                + New
                            </button>
                        </div>

                        {showCreateForm && (
                            <div className="border-b border-[#e5e3df] pb-4 mb-4">
                                <div className="space-y-3 text-sm">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={createForm.first_name}
                                        onChange={(e) => handleCreateInputChange('first_name', e.target.value)}
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={createForm.last_name}
                                        onChange={(e) => handleCreateInputChange('last_name', e.target.value)}
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={createForm.email}
                                        onChange={(e) => handleCreateInputChange('email', e.target.value)}
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={createForm.password}
                                        onChange={(e) => handleCreateInputChange('password', e.target.value)}
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone (optional)"
                                        value={createForm.phone}
                                        onChange={(e) => handleCreateInputChange('phone', e.target.value)}
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                    />
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => handleCreateInputChange('role', e.target.value)}
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                    >
                                        <option value="internal_user">Internal User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        onClick={handleCreateUser}
                                        disabled={creating}
                                        className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {creating ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {loadingUsers ? (
                            <div className="text-center py-4 text-slate-500">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-4 text-slate-500">No users found</div>
                        ) : (
                            <div className="space-y-2">
                                {users.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleUserSelect(u)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedUser?.id === u.id
                                            ? 'bg-[#1b2d4f] text-white'
                                            : 'bg-[#f9f8f6] hover:bg-[#f0efec]'
                                            } ${!u.is_active ? 'opacity-50' : ''}`}
                                    >
                                        <div className="font-semibold">{u.first_name} {u.last_name}</div>
                                        <div className="text-xs opacity-75">{u.email}</div>
                                        {!u.is_active && <div className="text-xs opacity-75">Deactivated</div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Details */}
                <div className="lg:col-span-2">
                    {selectedUser ? (
                        <div className="bg-white rounded-xl border border-[#e5e3df] p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                {selectedUser.first_name} {selectedUser.last_name}
                            </h2>

                            {/* Basic Info */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold mb-4">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                            className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                                            className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2 bg-[#f9f8f6]"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full border border-[#e5e3df] rounded px-3 py-2"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveUser}
                                    disabled={saving || selectedUser.id === currentUser?.id}
                                    className="bg-[#1b2d4f] text-white px-4 py-2 rounded font-semibold hover:bg-[#0f1a2e] disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            {/* Roles */}
                            <div className="mb-6 border-t border-[#e5e3df] pt-6">
                                <h3 className="text-lg font-bold mb-4">Roles</h3>
                                {selectedUser.roles && selectedUser.roles.length > 0 ? (
                                    <div className="space-y-2 mb-4">
                                        {selectedUser.roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className="flex justify-between items-center bg-[#f9f8f6] px-3 py-2 rounded"
                                            >
                                                <span className="font-semibold">{role.role}</span>
                                                {selectedUser.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleRemoveRole(role.id)}
                                                        disabled={saving}
                                                        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm mb-4">No roles assigned</p>
                                )}

                                {selectedUser.id !== currentUser?.id && (
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="flex-1 border border-[#e5e3df] rounded px-3 py-2 text-sm"
                                        >
                                            <option value="">Select role to add...</option>
                                            <option value="admin">Admin</option>
                                            <option value="internal_user">Internal User</option>
                                        </select>
                                        <button
                                            onClick={() => selectedRole && handleAddRole(selectedUser, selectedRole)}
                                            disabled={saving || !selectedRole}
                                            className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50 text-sm"
                                        >
                                            Add Role
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="border-t border-[#e5e3df] pt-6">
                                <h3 className="text-lg font-bold mb-4">Actions</h3>
                                {selectedUser.id !== currentUser?.id && (
                                    <button
                                        onClick={() => handleDeactivateUser(selectedUser)}
                                        disabled={saving}
                                        className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {selectedUser.is_active ? 'Deactivate User' : 'User Deactivated'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-[#e5e3df] p-6 text-center text-slate-500">
                            Select a user to view and manage details
                        </div>
                    )}
                </div>
            </div>
        </ProtectedAppPage>
    )
}
