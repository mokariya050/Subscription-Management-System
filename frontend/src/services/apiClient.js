// API Client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('access_token')

// Helper to make API requests
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    // Add auth token if exists
    const token = getAuthToken()
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    let response
    try {
        response = await fetch(url, {
            ...options,
            headers,
        })
    } catch {
        throw {
            status: 0,
            message: 'Unable to reach backend API. Check that backend is running on port 5000.',
            data: null,
        }
    }

    let data = null
    try {
        data = await response.json()
    } catch {
        data = null
    }

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
        }
        throw {
            status: response.status,
            message: data?.message || data?.error || (response.status === 401 ? 'Unauthorized. Please login again.' : 'API Error'),
            data,
        }
    }

    return data
}

// ==================== AUTH ENDPOINTS ====================

export const authAPI = {
    /**
     * Register a new user
     * @param {Object} userData - { email, password, first_name, last_name, phone }
     */
    register: async (userData) => {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        })
        // Store tokens
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data
    },

    /**
     * Login user
     * @param {string} email
     * @param {string} password
     */
    login: async (email, password) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })
        // Store tokens
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data
    },

    /**
     * Refresh access token
     */
    refresh: async () => {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const response = await apiRequest('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken }),
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
            },
        })
        localStorage.setItem('access_token', response.data.access_token)
        return response.data
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        return apiRequest('/auth/me', { method: 'GET' })
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' })
        } finally {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
        }
    },
}

// ==================== USER ENDPOINTS ====================

export const usersAPI = {
    /**
     * Get all users
     */
    getAll: async () => {
        return apiRequest('/users', { method: 'GET' })
    },

    /**
     * Get user by ID
     */
    getById: async (userId) => {
        return apiRequest(`/users/${userId}`, { method: 'GET' })
    },

    /**
     * Update user
     */
    update: async (userId, userData) => {
        return apiRequest(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        })
    },

    /**
     * Get user addresses
     */
    getAddresses: async (userId) => {
        return apiRequest(`/users/${userId}/addresses`, { method: 'GET' })
    },

    /**
     * Add address to user
     */
    addAddress: async (userId, addressData) => {
        return apiRequest(`/users/${userId}/addresses`, {
            method: 'POST',
            body: JSON.stringify(addressData),
        })
    },

    /**
     * Get user payment methods
     */
    getPaymentMethods: async (userId) => {
        return apiRequest(`/users/${userId}/payment-methods`, { method: 'GET' })
    },

    /**
     * Add payment method
     */
    addPaymentMethod: async (userId, paymentData) => {
        return apiRequest(`/users/${userId}/payment-methods`, {
            method: 'POST',
            body: JSON.stringify(paymentData),
        })
    },

    /**
     * Get user roles
     */
    getRoles: async (userId) => {
        return apiRequest(`/users/${userId}/roles`, { method: 'GET' })
    },

    /**
     * Assign role to user
     */
    assignRole: async (userId, role) => {
        return apiRequest(`/users/${userId}/roles`, {
            method: 'POST',
            body: JSON.stringify({ role }),
        })
    },
}

// ==================== PRODUCTS & PLANS ENDPOINTS ====================

export const productsAPI = {
    /**
     * Get all products
     */
    getAll: async () => {
        return apiRequest('/products', { method: 'GET' })
    },

    /**
     * Get product by ID
     */
    getById: async (productId) => {
        return apiRequest(`/products/${productId}`, { method: 'GET' })
    },

    /**
     * Create product
     */
    create: async (productData) => {
        return apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        })
    },

    /**
     * Update product
     */
    update: async (productId, productData) => {
        return apiRequest(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        })
    },

    /**
     * Delete product
     */
    delete: async (productId) => {
        return apiRequest(`/products/${productId}`, { method: 'DELETE' })
    },

    /**
     * Get all plans
     */
    getAllPlans: async () => {
        return apiRequest('/plans', { method: 'GET' })
    },

    /**
     * Get plan by ID
     */
    getPlanById: async (planId) => {
        return apiRequest(`/plans/${planId}`, { method: 'GET' })
    },

    /**
     * Create plan
     */
    createPlan: async (planData) => {
        return apiRequest('/plans', {
            method: 'POST',
            body: JSON.stringify(planData),
        })
    },

    /**
     * Update plan
     */
    updatePlan: async (planId, planData) => {
        return apiRequest(`/plans/${planId}`, {
            method: 'PUT',
            body: JSON.stringify(planData),
        })
    },

    /**
     * Delete plan
     */
    deletePlan: async (planId) => {
        return apiRequest(`/plans/${planId}`, { method: 'DELETE' })
    },

    /**
     * Get plan features
     */
    getPlanFeatures: async (planId) => {
        return apiRequest(`/plans/${planId}/features`, { method: 'GET' })
    },

    /**
     * Add feature to plan
     */
    addPlanFeature: async (planId, featureData) => {
        return apiRequest(`/plans/${planId}/features`, {
            method: 'POST',
            body: JSON.stringify(featureData),
        })
    },
}

// ==================== SUBSCRIPTIONS ENDPOINTS ====================

export const subscriptionsAPI = {
    /**
     * Get all subscriptions
     */
    getAll: async () => {
        return apiRequest('/subscriptions', { method: 'GET' })
    },

    /**
     * Get subscription by ID
     */
    getById: async (subscriptionId) => {
        return apiRequest(`/subscriptions/${subscriptionId}`, { method: 'GET' })
    },

    /**
     * Create subscription
     */
    create: async (subscriptionData) => {
        return apiRequest('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(subscriptionData),
        })
    },

    /**
     * Update subscription
     */
    update: async (subscriptionId, subscriptionData) => {
        return apiRequest(`/subscriptions/${subscriptionId}`, {
            method: 'PUT',
            body: JSON.stringify(subscriptionData),
        })
    },

    /**
     * Pause subscription
     */
    pause: async (subscriptionId) => {
        return apiRequest(`/subscriptions/${subscriptionId}/pause`, {
            method: 'POST',
        })
    },

    /**
     * Resume subscription
     */
    resume: async (subscriptionId) => {
        return apiRequest(`/subscriptions/${subscriptionId}/resume`, {
            method: 'POST',
        })
    },

    /**
     * Cancel subscription
     */
    cancel: async (subscriptionId) => {
        return apiRequest(`/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
        })
    },
}

// ==================== INVOICES & PAYMENTS ENDPOINTS ====================

export const invoicesAPI = {
    /**
     * Get all invoices
     */
    getAll: async () => {
        return apiRequest('/invoices', { method: 'GET' })
    },

    /**
     * Get invoice by ID
     */
    getById: async (invoiceId) => {
        return apiRequest(`/invoices/${invoiceId}`, { method: 'GET' })
    },

    /**
     * Create invoice
     */
    create: async (invoiceData) => {
        return apiRequest('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        })
    },

    /**
     * Update invoice
     */
    update: async (invoiceId, invoiceData) => {
        return apiRequest(`/invoices/${invoiceId}`, {
            method: 'PUT',
            body: JSON.stringify(invoiceData),
        })
    },

    /**
     * Send invoice
     */
    send: async (invoiceId) => {
        return apiRequest(`/invoices/${invoiceId}/send`, {
            method: 'POST',
        })
    },

    /**
     * Get invoice items
     */
    getItems: async (invoiceId) => {
        return apiRequest(`/invoices/${invoiceId}/items`, { method: 'GET' })
    },

    /**
     * Finalize invoice
     */
    finalize: async (invoiceId) => {
        return apiRequest(`/invoices/${invoiceId}/finalize`, {
            method: 'POST',
        })
    },

    /**
     * Process payment
     */
    processPayment: async (paymentData) => {
        return apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        })
    },

    /**
     * Get all payments
     */
    getAllPayments: async () => {
        return apiRequest('/payments', { method: 'GET' })
    },

    /**
     * Get payment by ID
     */
    getPaymentById: async (paymentId) => {
        return apiRequest(`/payments/${paymentId}`, { method: 'GET' })
    },
}

export default {
    authAPI,
    usersAPI,
    productsAPI,
    subscriptionsAPI,
    invoicesAPI,
}
