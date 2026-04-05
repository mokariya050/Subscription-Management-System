# Tech Stack & Implementation Guide
## Odoo Hackathon - Subscription Platform (20 Hours)

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js | UI/UX for customers & admins |
| **Backend** | Flask + Python | REST API + Business logic |
| **Database** | MySQL 8.0+ | Data persistence |
| **Auth** | JWT + bcrypt | User authentication |
| **Payment** | Mock Processor | Simulate payment (no real charges) |
| **Build** | Vite/CRA | React bundler |
| **Deployment** | Local/Docker | For demo purposes |

---

## 🛠️ What You're Building from Scratch

### **Backend (Flask)**

#### Core Modules to Build:

1. **Authentication (`auth.py`)**
   ```python
   - POST /api/auth/signup → Create user from email/password
   - POST /api/auth/login → Verify email+password, return JWT token
   - GET /api/auth/google → Redirect to Google OAuth login
   - GET /api/auth/google/callback → Handle Google OAuth redirect
   - POST /api/auth/logout → Invalidate session
   - GET /api/auth/me → Get current user (requires JWT)
   ```

2. **Products (`products.py`)**
   ```python
   - GET /api/products → List all active products
   - GET /api/products/<id> → Get product details + plans + features
   - POST /api/products → Admin: Create product
   - PUT /api/products/<id> → Admin: Update product
   - DELETE /api/products/<id> → Admin: Soft delete product
   ```

3. **Plans (`plans.py`)**
   ```python
   - GET /api/plans → List all plans
   - GET /api/plans/<id> → Get plan with features
   - POST /api/plans → Admin: Create plan
   ```

4. **Subscriptions (`subscriptions.py`)**
   ```python
   - POST /api/subscriptions → Create new subscription (checkout flow)
   - GET /api/subscriptions → Get user's subscriptions
   - GET /api/subscriptions/<id> → Get subscription details
   - PUT /api/subscriptions/<id> → Update subscription (pause, change plan)
   - DELETE /api/subscriptions/<id> → Cancel subscription
   ```

5. **Payments (Mock) (`payments.py`)**
   ```python
   - POST /api/payments/checkout → Process mock payment
   - GET /api/payments → List user's payments
   - Internal logic (no external API):
     - Validate card format
     - Create payment record
     - Mark as succeeded/failed
   ```

6. **Invoices (`invoices.py`)**
   ```python
   - GET /api/invoices → Get user's invoices
   - GET /api/invoices/<id> → Get invoice details
   - GET /api/invoices/<id>/download → Generate PDF (optional)
   ```

7. **Users (`users.py`)**
   ```python
   - GET /api/users/profile → Get current user
   - PUT /api/users/profile → Update profile
   - GET /api/users/addresses → Get user addresses
   - POST /api/users/addresses → Add address
   ```

8. **Admin Panel (`admin.py`)**
   ```python
   - GET /api/admin/stats → Dashboard metrics
   - GET /api/admin/subscriptions → All subscriptions (admin only)
   - GET /api/admin/users → All users (admin only)
   - GET /api/admin/invoices → All invoices (admin only)
   ```

9. **Background Jobs (`jobs.py`)**
   ```python
   Using APScheduler or Celery:
   - job_process_renewals() → Run hourly
     - Find subscriptions due for renewal
     - Generate invoices
     - Process mock payments
     - Update subscription periods
   
   - job_handle_trial_expiries() → Run daily
     - Find expired trials
     - Auto-activate or cancel subscriptions
   
   - job_cleanup() → Run weekly
     - Archive old invoices
     - Log cleanup actions
   ```

#### Key Flask Patterns:

```python
from flask import Flask, request, jsonify
from functools import wraps
import jwt
import bcrypt
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

# Middleware: JWT verification
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user_id = data['user_id']
        except:
            return {'error': 'Invalid token'}, 401
        return f(*args, **kwargs)
    return decorated

# Middleware: Role-based access
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Check if user_id has 'admin' role in DB
        if not user_has_role(request.user_id, 'admin'):
            return {'error': 'Unauthorized'}, 403
        return f(*args, **kwargs)
    return decorated

# Password hashing
def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password, hash):
    return bcrypt.checkpw(password.encode(), hash.encode())

# Routes example
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    # Hash password, create user, assign customer role
    # Return JWT token

@app.route('/api/subscriptions', methods=['POST'])
@token_required
def create_subscription():
    data = request.json
    # Validate plan_id, payment_method
    # Process mock payment
    # Create subscription, invoice, payment records
    # Return subscription details
```

---

### **Frontend (React)**

#### Components to Build:

1. **Auth Module**
   - `SignupPage` → Email, password form OR "Sign in with Google" button
   - `LoginPage` → Email, password form OR "Sign in with Google" button
   - `GoogleCallbackPage` → Handles OAuth redirect from Google
   - `PrivateRoute` → Guard authenticated routes

2. **Product Catalog**
   - `ProductList` → Display all products with plans
   - `ProductCard` → Individual product with pricing
   - `PlanSelector` → Show plans, features, select one

3. **Shopping Cart / Checkout**
   - `CartSummary` → Items, pricing, total
   - `AddressForm` → Billing address entry
   - `PaymentForm` → Card details (MOCK, just store data)
   - `CheckoutFlow` → Multi-step process

4. **Dashboard (Customer)**
   - `SubscriptionList` → Active subscriptions
   - `SubscriptionDetail` → Status, renewal date, actions
   - `InvoiceList` → Past invoices
   - `AddressBook` → Manage addresses
   - `PaymentMethods` → Manage cards

5. **Admin Panel**
   - `AdminDashboard` → Stats, metrics
   - `ProductManager` → CRUD products
   - `PlanManager` → CRUD plans with features
   - `UserList` → Search, manage users
   - `InvoiceList` → View all invoices
   - `RoleManager` → Assign roles to users

#### React Patterns:

```javascript
// API service
const api = {
  auth: {
    signup: (email, password, name) => 
      fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, ...name }),
        headers: { 'Content-Type': 'application/json' }
      }).then(r => r.json()),
    
    login: (email, password) => 
      fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }).then(r => r.json())
  },
  
  subscriptions: {
    list: (token) => 
      fetch('/api/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
    
    create: (planId, paymentMethodId, token) => 
      fetch('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId, payment_method_id: paymentMethodId }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).then(r => r.json())
  }
}

// Keep JWT in localStorage
localStorage.setItem('token', response.token);

// Use context for auth state
const AuthContext = React.createContext();
const useAuth = () => React.useContext(AuthContext);

// Protected routes
<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
```

---

## 📊 What NOT to Build

❌ **Don't build:**
- Real payment gateway integration (Stripe, PayPal)
- Email sending (SendGrid, Mailgun)
- Google OAuth / social login
- SMS notifications
- Advanced analytics dashboards
- Refund processing
- Usage-based billing
- Tax calculation
- Dunning (payment retry) logic beyond basic retry

✅ **Focus on:**
- Core subscription CRUD
- Mock payment processing  
- Invoice generation
- User authentication with JWT
- Role-based access control
- Basic admin dashboard
- Subscription renewals (mock)

---

## 🚀 Hackathon Timeline

### **Code Skeleton (Reality Check)**

```
Hours 0-2: Database + Schema setup
├── Import schema.sql into MySQL
├── Create test data
└── Verify connections

Hours 2-5: Backend Foundation (Flask)
├── Setup Flask app structure
│  ├── auth.py → Login/signup endpoints
│  ├── products.py → Product CRUD
│  └── db.py → Database connection
├── Database models (SQLAlchemy)
└── JWT middleware

Hours 5-8: Core APIs (Flask)
├── subscriptions.py → Create/list/cancel
├── payments.py → Mock payment processor
├── invoices.py → Invoice retrieval/generation
└── Audit logging

Hours 8-12: Frontend (React)
├── Setup React app (Vite/CRA)
├── Auth pages (signup, login)
├── Product catalog
├── Checkout flow (multi-step form)
└── User dashboard

Hours 12-16: Integration + Admin
├── Connect React to Flask APIs
├── Admin panel (CRUD products/plans)
├── Test end-to-end (signup → subscribe)
├── Background job setup (hourly renewal)
└── Invoice PDF generation (optional)

Hours 16-20: Polish + Deploy
├── Bug fixes and error handling
├── UI refinement
├── Test with sample data
├── Local deployment (Docker optional)
├── Demo preparation
└── Documentation
```

---

## 💡 Mock Payment Implementation

Instead of calling external APIs, implement like this:

```python
# backend/payments.py

def process_mock_payment(user_id, invoice_id, amount_cents, card_data):
    """
    Simulates payment processing without external gateway.
    """
    
    # Validate card format
    if not validate_card(card_data):
        return {
            'status': 'failed',
            'reason': 'Invalid card data'
        }
    
    # Simulate failure for specific card numbers (optional)
    if card_data.get('number').endswith('0000'):
        payment = Payment.create(
            invoice_id=invoice_id,
            user_id=user_id,
            amount_cents=amount_cents,
            status='failed',
            failure_reason='Simulated failure',
            transaction_ref=generate_ref()
        )
        return {'status': 'failed'}
    
    # Auto-succeed for all other cards (for demo)
    payment = Payment.create(
        invoice_id=invoice_id,
        user_id=user_id,
        amount_cents=amount_cents,
        status='succeeded',
        paid_at=datetime.now(),
        transaction_ref=generate_ref()
    )
    
    # Update invoice and subscription
    invoice = Invoice.get(invoice_id)
    invoice.update(status='paid', paid_at=datetime.now())
    
    subscription = Subscription.get(invoice.subscription_id)
    subscription.update(
        current_period_start=subscription.current_period_end,
        current_period_end=subscription.current_period_end + timedelta(days=30)
    )
    
    return {
        'status': 'succeeded',
        'transaction_ref': payment.transaction_ref
    }
```

---

## 📋 Deployment Notes

**For Hackathon (Local/Demo):**
- Flask: `python app.py` on `localhost:5000`
- React: `npm run dev` on `localhost:3000`
- MySQL: Local instance or Docker container
- No production security hardening needed

**Optional Docker Compose:**
```yaml
version: '3.9'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: subscription_platform
    ports:
      - "3306:3306"
  
  flask:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mysql
  
  react:
    build: ./frontend
    ports:
      - "3000:3000"
```

---

## ✅ Success Criteria

By end of 20 hours:
- [ ] User can sign up with email/password
- [ ] User can browse products and plans
- [ ] User can complete mock checkout
- [ ] Subscription created with "trialing" status
- [ ] Invoice auto-generated and stored
- [ ] Admin can create products and plans
- [ ] Subscriptions auto-renew (mock payments)
- [ ] Audit logs capture all actions
- [ ] Role-based access working (admin vs customer)
- [ ] Demo video showing full flow

---

Good luck coding! Remember: **finish** > **perfect**. A complete working demo (even if simple) beats a half-built feature-rich system. 🚀
