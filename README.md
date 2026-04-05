# Subscription Management System

Hackathon project for managing subscriptions, invoices, products, contacts, users, and customer checkout flows.

## Repository

- `backend/`: Flask API, auth, business logic, DB models, routes
- `frontend/`: React app (internal + customer flows)

## Tech Stack

- Frontend: React 18, React Router, Vite, Tailwind CSS, Axios
- Backend: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Marshmallow
- Database: MySQL (default), SQLite for tests
- Auth: JWT access/refresh tokens
- Integrations: Razorpay (payments), SMTP (OTP), Gemini (assistant)

## Core Modules

- Auth: login, signup, password reset with OTP
- Internal app: subscriptions, invoices, products, contacts, users, configuration pages
- Customer app: catalog, cart, orders, invoice/payment flow
- Security: encrypted request/response support in API client and backend middleware

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Default API base URL: `http://127.0.0.1:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Optional: Seed Sample Data

```bash
cd backend
python init_db.py
```

## Environment Notes

- Main backend config: `backend/config.py`
- Set secrets via `backend/.env` (JWT, DB, SMTP, Razorpay, Gemini)

## Demo Login

- Internal admin: `admin@acme.com` / `password123`