# Backend Integration Guide

This document explains how to integrate the Flask backend with the React frontend for the Subscription Management System.

## Overview

The backend is now running on a separate Flask server at `http://127.0.0.1:5000` (or your configured port). The frontend communicates with it via REST API calls.

## Backend URLs

- **Development Backend**: `http://127.0.0.1:5000`
- **Health Check**: `GET http://127.0.0.1:5000/api/health`

## Starting the Backend

### Step 1: Setup Database

Make sure MySQL is running. Create the database:

```bash
# In MySQL client
CREATE DATABASE subscription_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'subscription_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON subscription_management.* TO 'subscription_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:
```
DATABASE_URL=mysql+pymysql://subscription_user:secure_password@localhost:3306/subscription_management
JWT_SECRET_KEY=your-super-secret-key-change-in-production
```

### Step 4: Initialize Database (Optional - for sample data)

```bash
python init_db.py
```

This creates:
- Sample account: "Acme Corporation"
- 2 sample users (admin@acme.com, customer@acme.com) - both password: password123
- 2 products and 3 plans
- Sample subscription and invoice

### Step 5: Run the Backend

```bash
python run.py
```

Server starts on `http://127.0.0.1:5000`

You should see:
```
 * Running on http://0.0.0.0:5000
 * Press CTRL+C to quit
```

## Frontend Configuration

Update the frontend to communicate with the backend API. Create an API service in the frontend:

### `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Example: Authentication Hook

```javascript
// frontend/src/hooks/useAuth.js
import { useState } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (email, password, firstName, lastName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      const { user, access_token, refresh_token } = response.data.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, access_token, refresh_token } = response.data.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return { user, loading, error, register, login, logout };
};
```

## API Endpoints Summary

### Authentication
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login user
POST   /api/auth/refresh               - Refresh access token (JWT required)
POST   /api/auth/logout                - Logout user (JWT required)
GET    /api/auth/me                    - Get current user (JWT required)
```

### Users
```
GET    /api/users/                     - List users (JWT required)
GET    /api/users/<id>                 - Get user by ID (JWT required)
PUT    /api/users/<id>                 - Update user (JWT required)
GET    /api/users/<id>/roles           - Get user roles (JWT required)
POST   /api/users/<id>/roles           - Assign role (JWT required, admin)
GET    /api/users/<id>/addresses       - Get addresses (JWT required)
POST   /api/users/<id>/addresses       - Create address (JWT required)
GET    /api/users/<id>/payment-methods - Get payment methods (JWT required)
POST   /api/users/<id>/payment-methods - Create payment method (JWT required)
```

### Products & Plans
```
GET    /api/products/                  - List products
GET    /api/products/<id>              - Get product
POST   /api/products/                  - Create product (JWT required, admin)
PUT    /api/products/<id>              - Update product (JWT required, admin)
GET    /api/plans/                     - List plans
GET    /api/plans/<id>                 - Get plan
POST   /api/plans/                     - Create plan (JWT required, admin)
PUT    /api/plans/<id>                 - Update plan (JWT required, admin)
GET    /api/plans/<id>/features        - Get plan features
```

### Subscriptions
```
GET    /api/subscriptions/             - List user subscriptions (JWT required)
GET    /api/subscriptions/<id>         - Get subscription (JWT required)
POST   /api/subscriptions/             - Create subscription (JWT required)
POST   /api/subscriptions/<id>/cancel  - Cancel subscription (JWT required)
POST   /api/subscriptions/<id>/pause   - Pause subscription (JWT required)
POST   /api/subscriptions/<id>/resume  - Resume subscription (JWT required)
```

### Invoices
```
GET    /api/invoices/                  - List user invoices (JWT required)
GET    /api/invoices/<id>              - Get invoice (JWT required)
GET    /api/invoices/<id>/items        - Get invoice items (JWT required)
POST   /api/invoices/                  - Create invoice (JWT required, admin)
POST   /api/invoices/<id>/send         - Send invoice (JWT required, admin)
```

### Payments
```
GET    /api/payments/                  - List user payments (JWT required)
GET    /api/payments/<id>              - Get payment (JWT required)
POST   /api/payments/                  - Create payment (JWT required)
```

## Frontend to Backend Mapping

### Current Frontend Screens → Backend Endpoints

| Frontend Page | Backend Endpoint | Method | Purpose |
|---|---|---|---|
| `/login` | `/api/auth/login` | POST | User authentication |
| `/signup` | `/api/auth/register` | POST | User registration |
| `/home` | `/api/subscriptions/` | GET | List user subscriptions |
| `/subscription/other-info` | `/api/subscriptions/` | POST | Create new subscription |
| `/quotation-sent` | `/api/invoices/<id>` | GET | View invoice details |
| `/draft-invoice` | `/api/invoices/` | POST | Create invoice |
| `/invoice/new` | `/api/invoices/` | POST | Create new invoice |
| `/invoice/new/payment` | `/api/payments/` | POST | Record payment |
| `/subscription/detail` | `/api/subscriptions/<id>` | GET | View subscription details |

## Running Both Frontend and Backend

### Terminal 1: Backend
```bash
cd backend
python run.py
# Runs on http://127.0.0.1:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Runs on http://127.0.0.1:3003 (or 3002 if available)
```

## Testing with cURL

### Register User
```bash
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login User
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "password123"
  }'
```

### Get Current User (requires token)
```bash
curl -X GET http://127.0.0.1:5000/api/auth/me \
  -H "Authorization: Bearer your_access_token"
```

### List Subscriptions (requires token)
```bash
curl -X GET http://127.0.0.1:5000/api/subscriptions/ \
  -H "Authorization: Bearer your_access_token"
```

## Environment Variables for Frontend

Add to your `.env` file in the frontend directory:

```.env
REACT_APP_API_URL=http://127.0.0.1:5000/api
REACT_APP_API_TIMEOUT=30000
```

## Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

Handle errors in your frontend:

```javascript
try {
  const response = await api.post('/subscriptions/', { plan_id: 1 });
  if (response.data.success) {
    // Handle success
    const subscription = response.data.data;
  }
} catch (error) {
  // Handle error
  const errorMessage = error.response?.data?.error || 'An error occurred';
  console.error(errorMessage);
}
```

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3002`
- `http://localhost:3003`
- `http://127.0.0.1:3002`
- `http://127.0.0.1:3003`

To allow requests from a different origin, update the `CORS_ORIGINS` in `.env`.

## Authentication Flow

1. **Register/Login**: Get `access_token` and `refresh_token`
2. **Store Tokens**: Save in `localStorage`
3. **API Requests**: Include token in `Authorization: Bearer {token}` header
4. **Token Refresh**: Use `refresh_token` to get new `access_token` when expired
5. **Logout**: Clear tokens from localStorage

## Debugging

### View Backend Logs
The backend prints logs to console. Watch for:
- Database connection issues
- JWT validation errors
- CORS errors
- Request/response details (in debug mode)

### View Network Requests
In browser DevTools → Network tab:
- Check request headers (should have `Authorization: Bearer ...`)
- Check response status codes
- Check response body for error messages

### Test with Postman
1. Import API endpoints
2. Create environment variables for `BASE_URL` and `TOKEN`
3. Set Authorization header to `Bearer {{TOKEN}}`
4. Test each endpoint

## Production Deployment

Before deploying:

1. **Change Secret Keys**
   - Update `JWT_SECRET_KEY` in `.env`

2. **Configure Database**
   - Use production MySQL server
   - Update `DATABASE_URL` in `.env`

3. **Enable HTTPS**
   - Configure SSL certificates
   - Update CORS origins to use HTTPS

4. **Set Debug Off**
   - `FLASK_DEBUG=False`
   - `FLASK_ENV=production`

5. **Use Gunicorn**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
   ```

---

For more information see:
- Backend README: `backend/README.md`
- Database Schema: Branch `initial-database-design`
- API Documentation: Swagger OpenAPI (can be added)
