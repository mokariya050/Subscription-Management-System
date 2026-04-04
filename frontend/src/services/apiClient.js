// API Client for backend communication
import { encryptData, decryptData } from './encryption'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'

// Track token refresh in progress to avoid race conditions
let tokenRefreshPromise = null

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('access_token')

// Check if endpoint should use encryption
const shouldEncrypt = (endpoint) => {
    // Encrypt sensitive auth payloads too; keep logout plain because it has no body.
    if (endpoint.includes('/auth/logout')) return false
    return true
}

// Helper to refresh the access token
const refreshAccessToken = async () => {
    // If a refresh is already in progress, wait for it
    if (tokenRefreshPromise) {
        return tokenRefreshPromise
    }

    tokenRefreshPromise = (async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) {
                throw new Error('No refresh token available')
            }

            const url = `${API_BASE_URL}/auth/refresh`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`,
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })

            let data = null
            try {
                data = await response.json()
            } catch {
                data = null
            }

            if (!response.ok) {
                throw new Error('Token refresh failed')
            }

            // Store new access token and update expiration
            localStorage.setItem('access_token', data.data.access_token)
            localStorage.setItem('token_expires_at', Date.now() + (59 * 60 * 1000)) // 59 minutes from now

            return data.data.access_token
        } catch (error) {
            // If refresh fails, clear auth data
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            localStorage.removeItem('token_expires_at')
            throw error
        } finally {
            tokenRefreshPromise = null
        }
    })()

    return tokenRefreshPromise
}

// Helper to make API requests
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    let body = options.body
    const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData
    let headers = {
        ...options.headers,
    }

    if (!isFormDataBody && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
    }

    // Encrypt request body if applicable
    const useEncryption = !isFormDataBody && shouldEncrypt(endpoint) && options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)
    if (useEncryption && body) {
        try {
            const bodyData = typeof body === 'string' ? JSON.parse(body) : body
            const encryptedBody = await encryptData(bodyData)
            body = encryptedBody
            headers['X-Encrypted'] = 'true'
        } catch (error) {
            console.error('Failed to encrypt request:', error)
            throw {
                status: 0,
                message: 'Request encryption failed. Request was blocked for security.',
                data: null,
            }
        }
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
            body,
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
        const responseText = await response.text()
        // Try to decrypt if response is encrypted
        if (response.headers.get('X-Encrypted') === 'true') {
            try {
                data = decryptData(responseText)
            } catch {
                data = JSON.parse(responseText)
            }
        } else {
            data = JSON.parse(responseText)
        }
    } catch {
        data = null
    }

    if (!response.ok) {
        if (response.status === 401 && options.method !== 'POST' && !endpoint.includes('/auth/')) {
            // Token might be expired, attempt to refresh
            try {
                const newToken = await refreshAccessToken()
                // Retry the original request with the new token
                let retryBody = options.body
                const retryIsFormData = typeof FormData !== 'undefined' && retryBody instanceof FormData
                let retryHeaders = {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`,
                }

                if (!retryIsFormData && !retryHeaders['Content-Type']) {
                    retryHeaders['Content-Type'] = 'application/json'
                }

                // Re-encrypt if needed
                const retryUseEncryption = !retryIsFormData && shouldEncrypt(endpoint) && options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)
                if (retryUseEncryption && retryBody) {
                    try {
                        const bodyData = typeof retryBody === 'string' ? JSON.parse(retryBody) : retryBody
                        retryBody = await encryptData(bodyData)
                        retryHeaders['X-Encrypted'] = 'true'
                    } catch (error) {
                        console.error('Failed to encrypt retry request:', error)
                        throw {
                            status: 0,
                            message: 'Retry request encryption failed. Request was blocked for security.',
                            data: null,
                        }
                    }
                }

                const retryResponse = await fetch(url, {
                    ...options,
                    headers: retryHeaders,
                    body: retryBody,
                })

                let retryData = null
                try {
                    const retryResponseText = await retryResponse.text()
                    if (retryResponse.headers.get('X-Encrypted') === 'true') {
                        try {
                            retryData = decryptData(retryResponseText)
                        } catch {
                            retryData = JSON.parse(retryResponseText)
                        }
                    } else {
                        retryData = JSON.parse(retryResponseText)
                    }
                } catch {
                    retryData = null
                }

                if (retryResponse.ok) {
                    return retryData
                }

                // If retry fails, return the error
                throw {
                    status: retryResponse.status,
                    message: retryData?.message || retryData?.error || 'API Error',
                    data: retryData,
                }
            } catch (refreshError) {
                // Refresh failed, clear session and throw error
                throw {
                    status: 401,
                    message: 'Session expired. Please login again.',
                    data: null,
                }
            }
        }

        if (response.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            localStorage.removeItem('token_expires_at')
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

    /**
     * Request OTP for password recovery
     * @param {string} email
     */
    forgotPassword: async (email) => {
        const response = await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        })
        return response.data || {}
    },

    /**
     * Verify OTP before allowing password reset
     * @param {Object} payload - { email, otp }
     */
    verifyResetOtp: async (payload) => {
        const response = await apiRequest('/auth/verify-reset-otp', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        return response.data || {}
    },

    /**
     * Reset password using OTP
     * @param {Object} payload - { email, otp, new_password }
     */
    resetPasswordWithOtp: async (payload) => {
        const response = await apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        return response.data || {}
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

    /**
     * Create a new user
     */
    create: async (userData) => {
        return apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        })
    },

    /**
     * Deactivate (soft delete) a user
     */
    deactivateUser: async (userId) => {
        return apiRequest(`/users/${userId}/deactivate`, {
            method: 'POST',
        })
    },

    /**
     * Remove role from user
     */
    removeRole: async (roleId) => {
        return apiRequest(`/users/roles/${roleId}`, {
            method: 'DELETE',
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
     * Upload product images
     */
    uploadImages: async (productId, files) => {
        const formData = new FormData()
        files.forEach((file) => formData.append('images', file))

        return apiRequest(`/products/${productId}/images`, {
            method: 'POST',
            body: formData,
        })
    },

    /**
     * Delete product image
     */
    deleteImage: async (productId, imageId) => {
        return apiRequest(`/products/${productId}/images/${imageId}`, {
            method: 'DELETE',
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

// ==================== CUSTOMER STORE ENDPOINTS ====================

export const storeAPI = {
    getCustomerKey: () => {
        let key = localStorage.getItem('customer_key')

        if (!key) {
            key = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `customer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            localStorage.setItem('customer_key', key)
        }

        return key
    },

    storeHeaders: () => ({
        'X-Customer-Key': storeAPI.getCustomerKey(),
    }),

    getFilters: async () => {
        return apiRequest('/store/filters', {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    getInsights: async () => {
        return apiRequest('/store/insights', {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    chatAssistant: async ({ message, history = [], systemPrompt, context }) => {
        return apiRequest('/store/chat', {
            method: 'POST',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify({
                message,
                history,
                system_prompt: systemPrompt,
                context,
            }),
        })
    },

    getProduct: async (productId) => {
        return apiRequest(`/store/products/${productId}`, {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    getCatalog: async ({
        q,
        category,
        priceRange,
        sort = 'price_asc',
        page = 1,
        perPage = 16,
    } = {}) => {
        const params = new URLSearchParams()

        if (q) params.set('q', q)
        if (category && category !== 'all') params.set('category', category)
        if (priceRange && priceRange !== 'all') params.set('price_range', priceRange)
        if (sort) params.set('sort', sort)
        params.set('page', String(page))
        params.set('per_page', String(perPage))

        const query = params.toString()
        return apiRequest(`/store/catalog${query ? `?${query}` : ''}`, {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    getCart: async () => {
        return apiRequest('/store/cart', {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    addCartItem: async ({ productId, planId, quantity = 1 }) => {
        return apiRequest('/store/cart/items', {
            method: 'POST',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify({
                product_id: productId,
                plan_id: planId,
                quantity,
            }),
        })
    },

    updateCartItem: async (lineId, quantity) => {
        return apiRequest(`/store/cart/items/${lineId}`, {
            method: 'PUT',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify({ quantity }),
        })
    },

    removeCartItem: async (lineId) => {
        return apiRequest(`/store/cart/items/${lineId}`, {
            method: 'DELETE',
            headers: storeAPI.storeHeaders(),
        })
    },

    applyDiscount: async (code) => {
        return apiRequest('/store/cart/discount', {
            method: 'POST',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify({ code }),
        })
    },

    checkout: async ({ address, paymentMethod }) => {
        return apiRequest('/store/checkout', {
            method: 'POST',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify({
                address,
                payment_method: paymentMethod,
            }),
        })
    },

    verifyOrderPayment: async (orderId, payload) => {
        return apiRequest(`/store/orders/${orderId}/verify-payment`, {
            method: 'POST',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify(payload),
        })
    },

    createOrderPaymentSession: async (orderId) => {
        return apiRequest(`/store/orders/${orderId}/payment-session`, {
            method: 'POST',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify({}),
        })
    },

    getOrder: async (orderId) => {
        return apiRequest(`/store/orders/${orderId}`, {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    listOrders: async () => {
        return apiRequest('/store/orders', {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    getInvoice: async (orderId) => {
        return apiRequest(`/store/orders/${orderId}/invoice`, {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    getProfile: async () => {
        return apiRequest('/store/profile', {
            method: 'GET',
            headers: storeAPI.storeHeaders(),
        })
    },

    updateProfile: async (payload) => {
        return apiRequest('/store/profile', {
            method: 'PUT',
            headers: storeAPI.storeHeaders(),
            body: JSON.stringify(payload),
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
     * Get invoices for subscription
     */
    getInvoices: async (subscriptionId) => {
        return apiRequest(`/subscriptions/${subscriptionId}/invoices`, { method: 'GET' })
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

// ==================== CONFIGURATION ENDPOINTS ====================

export const configurationAPI = {
    getAttributes: async () => {
        return apiRequest('/attributes', { method: 'GET' })
    },

    createAttribute: async (payload) => {
        return apiRequest('/attributes', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    updateAttribute: async (attributeId, payload) => {
        return apiRequest(`/attributes/${attributeId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    getAttributeValues: async (attributeId) => {
        return apiRequest(`/attributes/${attributeId}/values`, { method: 'GET' })
    },

    createAttributeValue: async (attributeId, payload) => {
        return apiRequest(`/attributes/${attributeId}/values`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    deleteAttributeValue: async (valueId) => {
        return apiRequest(`/attributes/values/${valueId}`, { method: 'DELETE' })
    },

    getQuotationTemplates: async () => {
        return apiRequest('/quotation-templates', { method: 'GET' })
    },

    createQuotationTemplate: async (payload) => {
        return apiRequest('/quotation-templates', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    updateQuotationTemplate: async (templateId, payload) => {
        return apiRequest(`/quotation-templates/${templateId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    getDiscounts: async () => {
        return apiRequest('/discounts', { method: 'GET' })
    },

    createDiscount: async (payload) => {
        return apiRequest('/discounts', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    updateDiscount: async (discountId, payload) => {
        return apiRequest(`/discounts/${discountId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    getTaxes: async () => {
        return apiRequest('/taxes', { method: 'GET' })
    },

    createTax: async (payload) => {
        return apiRequest('/taxes', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    updateTax: async (taxId, payload) => {
        return apiRequest(`/taxes/${taxId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    getPaymentTerms: async () => {
        return apiRequest('/payment-terms', { method: 'GET' })
    },

    createPaymentTerm: async (payload) => {
        return apiRequest('/payment-terms', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    updatePaymentTerm: async (paymentTermId, payload) => {
        return apiRequest(`/payment-terms/${paymentTermId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },
}

export default {
    authAPI,
    usersAPI,
    productsAPI,
    storeAPI,
    subscriptionsAPI,
    invoicesAPI,
    configurationAPI,
}
