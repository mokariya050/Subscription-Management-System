# Subscription Management System - Backend API

Flask-based REST API for the Subscription Management System. Provides complete subscription, invoicing, and payment management functionality.

## Features

- ✅ **Authentication & Authorization**
  - User registration and login
  - JWT token-based authentication
  - Role-based access control (Admin, Manager, Customer, Viewer)
  - Refresh token mechanism

- ✅ **User Management**
  - User profiles and account management
  - Address management (billing/shipping)
  - Payment methods
  - User roles and permissions

- ✅ **Product & Plan Management**
  - Product catalog
  - Tiered pricing plans
  - Plan features
  - Trial period support

- ✅ **Subscription Management**
  - Create subscriptions
  - Pause/Resume subscriptions
  - Cancel subscriptions
  - Subscription status tracking
  - Trial period handling

- ✅ **Invoice Management**
  - Auto-generated invoices
  - Manual invoice creation
  - Invoice line items
  - Invoice status tracking
  - Invoice sending

- ✅ **Payment Processing**
  - Payment recording
  - Multi-partial payments
  - Payment status tracking
  - Mock payment processing (for demo)

- ✅ **Audit Logging**
  - Action audit trail
  - Change history
  - User activity tracking
  - Error logging

## Technology Stack

- **Framework**: Flask 2.3.3
- **Database**: MySQL 8.0+ with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **Serialization**: Marshmallow
- **CORS**: Flask-CORS
- **Password Hashing**: bcrypt

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models/
│   │   └── __init__.py      # SQLAlchemy models (Account, User, Subscription, Invoice, Payment, etc.)
│   ├── schemas/
│   │   └── __init__.py      # Marshmallow schemas for serialization
│   ├── routes/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User management endpoints
│   │   ├── products.py      # Product & Plan endpoints
│   │   ├── subscriptions.py # Subscription endpoints
│   │   └── invoices.py      # Invoice & Payment endpoints
│   └── utils/
│       └── __init__.py      # Helper functions (password hashing, JWT decorators, audit logging)
├── config.py                # Configuration management
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and update DATABASE_URL and JWT_SECRET_KEY
```

### 3. Database Setup

Create MySQL database:

```sql
CREATE DATABASE subscription_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'subscription_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON subscription_management.* TO 'subscription_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env`:
```
DATABASE_URL=mysql+pymysql://subscription_user:secure_password@localhost:3306/subscription_management
```

### 4. Run the Application

```bash
python run.py
```

Server will start on `http://127.0.0.1:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/` - List all users (admin) or self
- `GET /api/users/<id>` - Get user by ID
- `PUT /api/users/<id>` - Update user profile
- `GET /api/users/<id>/roles` - Get user roles
- `POST /api/users/<id>/roles` - Assign role to user
- `GET /api/users/<id>/addresses` - Get user addresses
- `POST /api/users/<id>/addresses` - Create address
- `GET /api/users/<id>/payment-methods` - Get payment methods
- `POST /api/users/<id>/payment-methods` - Create payment method

### Products & Plans
- `GET /api/products/` - List products
- `GET /api/products/<id>` - Get product
- `POST /api/products/` - Create product (admin)
- `PUT /api/products/<id>` - Update product (admin)
- `GET /api/plans/` - List plans
- `GET /api/plans/<id>` - Get plan
- `POST /api/plans/` - Create plan (admin)
- `PUT /api/plans/<id>` - Update plan (admin)
- `GET /api/plans/<id>/features` - Get plan features

### Subscriptions
- `GET /api/subscriptions/` - List user subscriptions
- `GET /api/subscriptions/<id>` - Get subscription
- `POST /api/subscriptions/` - Create subscription
- `POST /api/subscriptions/<id>/cancel` - Cancel subscription
- `POST /api/subscriptions/<id>/pause` - Pause subscription
- `POST /api/subscriptions/<id>/resume` - Resume subscription

### Invoices
- `GET /api/invoices/` - List user invoices
- `GET /api/invoices/<id>` - Get invoice
- `GET /api/invoices/<id>/items` - Get invoice items
- `POST /api/invoices/` - Create invoice (admin)
- `POST /api/invoices/<id>/send` - Send invoice (admin)

### Payments
- `GET /api/payments/` - List user payments
- `GET /api/payments/<id>` - Get payment
- `POST /api/payments/` - Create payment

## Request/Response Examples

### Register User

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password_123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1-555-0123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "account_id": 1
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Create Subscription

**Request:**
```bash
POST /api/subscriptions/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "plan_id": 1,
  "payment_method_id": 1,
  "metadata": {
    "purchased_for_project": "acme-corp-2025"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created",
  "data": {
    "subscription": {
      "id": 1,
      "user_id": 1,
      "plan_id": 1,
      "status": "active",
      "current_period_start": "2025-04-04T12:00:00",
      "current_period_end": "2025-05-04T12:00:00"
    },
    "invoice": {
      "id": 1,
      "invoice_number": "INV-1-1",
      "total_amount_cents": 9999,
      "status": "draft"
    }
  }
}
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer {access_token}
```

Get token via `/api/auth/login` endpoint after registration.

## Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Database Schema

Database schema is designed based on the `initial-database-design` branch schema. Key tables:

- `accounts` - Companies/Organizations
- `users` - Individual users
- `user_roles` - Role-based access control
- `addresses` - User addresses
- `payment_methods` - Payment cards/methods
- `products` - Products catalog
- `plans` - Pricing plans
- `plan_features` - Plan features
- `subscriptions` - Active subscriptions
- `invoices` - Billing statements
- `invoice_items` - Invoice line items
- `payments` - Payment transactions
- `audit_logs` - Activity audit trail

## Development

### Run in Debug Mode

```bash
FLASK_DEBUG=True python run.py
```

### Run with Different Config

```bash
FLASK_ENV=testing python run.py
```

### Database Migrations (Future)

When using Alembic for migrations:

```bash
flask db init
flask db migrate -m "Description"
flask db upgrade
```

## Security Considerations

1. **Change JWT_SECRET_KEY** in production
2. **Use HTTPS** in production
3. **Validate all inputs** - Marshmallow schemas provide validation
4. **Hash passwords** - bcrypt is used automatically
5. **CORS configuration** - Update `CORS_ORIGINS` in `.env`
6. **Database credentials** - Never commit `.env` file
7. **Rate limiting** - Consider adding in production
8. **SQL injection** - SQLAlchemy prevents via parameterized queries

## Testing

Run tests (when implemented):

```bash
pytest
```

## Documentation

- Database schema: `../initial-database-design/SCHEMA_DESIGN.md`
- API using OpenAPI/Swagger (can be added with `flask-restx`)

## Deployment

### Using Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

## Future Enhancements

- OAuth2 integration (Google, GitHub)
- Email notifications
- Webhook support
- Metered billing
- Automated billing cycles
- Refund handling
- Multi-currency support
- Tax calculation
- Discount/Coupon system
- API rate limiting
- Swagger/OpenAPI documentation
- GraphQL endpoint

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

ISC License - See LICENSE file

---

Built with ❤️ for the Subscription Management System
