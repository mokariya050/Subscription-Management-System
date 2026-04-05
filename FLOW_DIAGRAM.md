# System Flow & User Journeys
## Subscription E-Commerce Platform

---

## 🔄 High-Level User Journeys

### **Journey 1: New Customer Sign Up → Subscribe**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LANDING PAGE (unauthenticated user)                          │
│    - Sees product catalog                                       │
│    - Clicks "Sign Up" or "Subscribe to Pro"                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 2. SIGNUP/LOGIN FORM                                            │
│    Option A: Email + Password                                   │
│    ├─ Email address                                             │
│    ├─ Password + Confirm password                               │
│    └─ First & Last name                                         │
│                                                                 │
│    Option B: "Sign in with Google"                              │
│    ├─ User clicks button                                        │
│    ├─ Redirected to Google OAuth consent screen                 │
│    ├─ User grants permission                                    │
│    └─ Redirected back to app with auth code                     │
│                                                                 │
│    DATA CREATED (Email/Password):                               │
│    [users] → new row (email, password_hash via bcrypt)          │
│                                                                 │
│    DATA CREATED (Google OAuth):                                 │
│    [users] → new row (email, oauth_provider='google',           │
│               oauth_id=google_user_id, password_hash=NULL)      │
│                                                                 │
│    Both: [user_roles] → 'customer' role assigned                │
│          [audit_logs] → action='user_registered'                │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 3. EMAIL VERIFICATION (optional)                                │
│    - Backend sends verification email with JWT token            │
│    - User clicks link to verify                                 │
│    - [users.email_verified_at] updated                          │
│                                                                 │
│    AUDIT LOG: action = 'email_verified'                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 4. PRODUCT CATALOG PAGE                                         │
│    - Display products with plans and pricing                    │
│    - User clicks "Choose Plan" on Pro (monthly, $29.99)         │
│                                                                 │
│    QUERY: SELECT p.*, pl.* FROM products p                     │
│            JOIN plans pl ON p.id = pl.product_id                │
│            WHERE p.is_active = 1                                │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 5. CHECKOUT PAGE                                                │
│    a. Select billing address (or create new)                    │
│       [addresses] → insert (user_id, address_type='billing')    │
│                                                                 │
│    b. Enter payment card (MOCK DATA)                            │
│       [payment_methods] → insert (user_id, card_holder_name,    │
│       card_number_last4, exp_month, exp_year)                   │
│       NOTE: No real payment processing, just store card info   │
│                                                                 │
│    c. Review order                                              │
│       Display: Plan name, price, trial (14 days), total due     │
│                                                                 │
│    d. Click "Subscribe Now"                                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 6. PAYMENT PROCESSING (Backend - MOCK)                          │
│    a. Validate card data (basic validation only)                │
│                                                                 │
│    b. Process mock payment (no external API):                   │
│       - Check if card data is valid format                      │
│       - Create payment record with status='succeeded'           │
│       - (In real world, this calls Stripe/PayPal)               │
│                                                                 │
│    c. Create subscription & invoice:                            │
│       [subscriptions] → insert (status='trialing')              │
│       [invoices] → insert (status='open', amount=$29.99)        │
│       [invoice_items] → insert (description, price)             │
│       [payments] → insert (status='succeeded')                  │
│       AUDIT LOG: action='subscription_created'                  │
│                                                                 │
│    d. If payment fails (optional mock failure):                 │
│       [payments] → insert (status='failed', failure_reason)     │
│       AUDIT LOG: action='payment_failed'                        │
│       Show user: "Payment failed. Please try again."            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 7. CONFIRMATION                                                 │
│    User sees:                                                   │
│    ✓ Subscription active for 14-day trial                       │
│    ✓ Invoice ID and download link (PDF generation optional)     │
│    ✓ Next renewal date: [current_period_end]                    │
│                                                                 │
│    (Email sending is optional - store data only)                │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 8. USER DASHBOARD                                               │
│    User can:                                                    │
│    - View active subscription status (trialing/active)          │
│    - See trial ends in 14 days                                  │
│    - Download past invoices                                     │
│    - Update payment method (for future renewals)                │
│    - Cancel subscription                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Journey 2: Admin Creates New Product**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ADMIN LOGIN                                                  │
│    - Admin enters email/password                                │
│    - System checks: user.role = 'admin' (from user_roles)       │
│    - Access granted to admin dashboard                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 2. PRODUCTS PAGE                                                │
│    - List all existing products                                 │
│    - Admin clicks "Create New Product"                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 3. PRODUCT FORM                                                 │
│    Admin fills:                                                 │
│    - Name: "Enterprise Plan"                                    │
│    - Description: "For large teams..."                          │
│    - Type: "subscription_base"                                  │
│    - Base Price: $99.99                                         │
│    - SKU: "ENT-001"                                             │
│                                                                 │
│    DATA CREATE:                                                 │
│    [products] → insert (account_id, sku, name, price_cents)     │
│    AUDIT LOG: action='product_created', user_id=admin_id       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 4. CREATE PLANS FOR PRODUCT                                     │
│    Admin creates two plans:                                     │
│                                                                 │
│    Plan 1:                                                      │
│    - Name: "Enterprise Monthly"                                 │
│    - Price: $99.99/month                                        │
│    - Trial: 30 days                                             │
│    [plans] → insert (product_id, name, price_cents, interval)   │
│                                                                 │
│    Plan 2:                                                      │
│    - Name: "Enterprise Annual"                                  │
│    - Price: $999/year (save 17%)                                │
│    - Trial: 30 days                                             │
│    [plans] → insert (product_id, name, price_cents, interval)   │
│                                                                 │
│    AUDIT LOG: 2x action='plan_created'                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 5. ADD FEATURES TO PLANS                                        │
│    Admin adds features:                                         │
│                                                                 │
│    [plan_features] → insert multiple rows:                      │
│    - "Team Members": "50 seats"                                 │
│    - "API Access": "10,000 requests/day"                        │
│    - "Priority Support": "24/7 live chat"                       │
│    - "Advanced Analytics": "Custom reports"                     │
│    - "White-label": "Unlimited"                                 │
│                                                                 │
│    AUDIT LOG: 5x action='feature_added'                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 6. PUBLISH PRODUCT                                              │
│    - Admin clicks "Publish"                                     │
│    - [products.is_active] = 1                                   │
│    - [products.updated_at] = NOW()                              │
│    - Product now visible to all customers                       │
│                                                                 │
│    AUDIT LOG: action='product_published'                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 7. PRODUCT NOW LIVE                                             │
│    - Appears in product catalog                                 │
│    - Customers can browse and select plans                      │
│    - Analytics show impressions, signups, etc.                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Journey 3: Recurring Billing (Automated Background Job)**

```
BACKGROUND JOB: Every hour (or hourly check)
┌─────────────────────────────────────────────────────────────────┐
│ 1. FIND SUBSCRIPTIONS DUE FOR RENEWAL                           │
│                                                                 │
│    SELECT s.*, u.*, pm.*, p.price_cents                        │
│    FROM subscriptions s                                         │
│    JOIN users u ON s.user_id = u.id                            │
│    JOIN payment_methods pm ON s.payment_method_id = pm.id       │
│    JOIN plans p ON s.plan_id = p.id                            │
│    WHERE s.status = 'active'                                   │
│    AND s.current_period_end <= DATE_ADD(NOW(), INTERVAL 1 HOUR)│
│                                                                 │
│    Result: 5 subscriptions ready to renew                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 2. FOR EACH SUBSCRIPTION:                                       │
│                                                                 │
│    a. Generate Invoice                                          │
│       [invoices] → insert (                                     │
│         subscription_id, user_id, invoice_number='INV-2025-xxx',
│         period_start=current_period_start,                      │
│         period_end=current_period_end,                          │
│         total_amount_cents=plan_price,                          │
│         status='open'                                           │
│       )                                                         │
│                                                                 │
│    b. Add Line Item to Invoice                                  │
│       [invoice_items] → insert (                                │
│         invoice_id, description='[Plan Name] ([Month])',        │
│         amount_cents = plan_price                               │
│       )                                                         │
│                                                                 │
│    c. Process Mock Payment                                      │
│       Backend logic (NO external API call):                     │
│       - Validate payment method exists                          │
│       - Simulate payment processing                             │
│       - Auto-succeed for demo (or implement rules)              │
│                                                                 │
│       [payments] → insert (                                     │
│         invoice_id, amount_cents,                               │
│         status='succeeded',                                     │
│         transaction_ref='TXN_xxxxx' (internal ID),              │
│         paid_at=NOW()                                           │
│       )                                                         │
│                                                                 │
│       [invoices] → UPDATE (status='paid', paid_at=NOW())        │
│                                                                 │
│       [subscriptions] → UPDATE (                                │
│         current_period_start=old_current_period_end,            │
│         current_period_end=DATE_ADD(NOW(), INTERVAL 1 MONTH)   │
│       )                                                         │
│                                                                 │
│    d. Log Audit Entry                                           │
│       [audit_logs] → insert (                                   │
│         action='invoice_generated' or 'payment_succeeded',      │
│         table_name='invoices',                                  │
│         record_id=invoice_id,                                   │
│         new_value=JSON(invoice_data),                           │
│         status='success'                                        │
│       )                                                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│ 3. HANDLE TRIAL EXPIRATIONS (Run daily)                         │
│                                                                 │
│    SELECT s.* FROM subscriptions s                             │
│    WHERE s.status = 'trialing'                                 │
│    AND s.trial_ends_at <= NOW()                                │
│                                                                 │
│    For each trial ending:                                       │
│    a. Update: status = 'active' (subscription activated)        │
│    b. OR: Cancel trial (if user wants)                          │
│    c. Log in audit_logs                                         │
└─────────────────────────────────────────────────────────────────┘
```
```

---

### **Journey 4: User Cancels Subscription**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER DASHBOARD                                               │
│    - User clicks "Cancel Subscription"                          │
│    - System shows: "Confirm you want to cancel?"                │
│                                                                 │
│    Option A: Cancel Immediately                                │
│    Option B: Cancel at End of Billing Period                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
            ┌─────┴─────┐
            │           │
     ┌──────▼────┐  ┌───▼──────────────┐
     │ IMMEDIATE │  │ END OF PERIOD    │
     └──────┬────┘  └───┬──────────────┘
            │            │
     ┌──────▼────────────▼──────────────────┐
     │ [subscriptions] → UPDATE              │
     │   status = 'canceled'                 │
     │   canceled_at = NOW()                 │
     │   cancellation_reason = [reason]      │
     │                                       │
     │ OR                                    │
     │                                       │
     │   cancel_at_period_end = 1            │
     │   (status stays 'active' until end)   │
     └──────┬────────────────────────────────┘
            │
     ┌──────▼────────────────────────────────┐
     │ [audit_logs] → insert                  │
     │   action = 'subscription_canceled'    │
     │   reason = 'too_expensive' / 'other' │
     └──────┬────────────────────────────────┘
            │
     ┌──────▼────────────────────────────────┐
     │ Send Confirmation Email               │
     │ - Cancellation confirmed              │
     │ - Last invoice available              │
     │ - Offer to re-subscribe later         │
     │ - Feedback form (optional)            │
     └─────────────────────────────────────────┘
```

---

## 📊 Database Activity Timeline

```
TIME    USER ACTION                  DATABASE TABLES AFFECTED
────────────────────────────────────────────────────────────────────────

Day 1:
  10:00 User A signs up              → users, user_roles, audit_logs
  10:05 Subscribes to Pro Plan        → subscriptions, invoices, 
                                         invoice_items, payments, 
                                         audit_logs
  10:06 Email with invoice sent       → (external email service)

Day 2:
  15:00 User B signs up              → users, user_roles, audit_logs
  15:15 Subscribes to Pro Plan        → subscriptions, invoices, 
                                         invoice_items, payments, 
                                         audit_logs

Day 8:
  03:00 Background job runs:
        - Find subs ending today
        - Generate invoices 
        - Try charging payments
        - Update subscription dates     → invoices, invoice_items, 
                                           payments, subscriptions, 
                                           audit_logs

Day 15:
  14:00 User A cancels               → subscriptions, audit_logs
        (triggers cancellation logic)

Day 22:
  09:00 Background job runs:
        Generate invoice for User B renewal
        
Day 30:
  All active subscriptions renewed    → invoices, payments, 
                                          subscriptions

Day 45:
  Annual reports generated           → READ-ONLY queries on all tables
```

---

## 🔐 Security Data Flow

```
┌────────────────────────────────────────────────────┐
│ FRONTEND (React/Vue/Mobile)                        │
│ - User enters password                             │
└──────────────┬───────────────────────────────────┘
               │ (HTTPS encrypted)
┌──────────────▼───────────────────────────────────┐
│ API BACKEND (Node/Python/Go)                     │
│ - Receives password                              │
│ - Hash with bcrypt/Argon2 (NEVER STORE PLAINTEXT)
│ - Compare with DB hash                           │
│ - Generate JWT token (signed)                    │
└──────────────┬───────────────────────────────────┘
               │ Return JWT to frontend
┌──────────────▼───────────────────────────────────┐
│ MYSQL DATABASE                                   │
│ - Only stores password_hash (irreversible)      │
│ - NO plaintext passwords EVER                   │
│ - All user data encrypted at rest               │
└──────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ PAYMENT FLOW (PCI-DSS Compliant)                  │
│                                                  │
│ User card info → Stripe/PayPal ONLY              │
│ (Your server never touches card numbers)         │
│                                                  │
│ Stripe returns: payment_method_token_id          │
│                                                  │
│ You store: provider_payment_method_id (token)    │
│ Not: card number, CVV, or full PAN               │
└────────────────────────────────────────────────────┘
```

---

## 📈 Key States & Transitions

### **Subscription Lifecycle**

```
           signup
             │
             ▼
        ┌─────────────┐
        │  TRIALING   │ ← 14-day free trial
        └──────┬──────┘
               │ trial expires OR manual upgrade
               ▼
        ┌─────────────┐
        │   ACTIVE    │ ← customer is paying
        └──┬──────┬───┘
           │      │
    [payment fails] [customer cancels]
           │      │
           ▼      ▼
        ┌─────────────┐     ┌──────────────┐
        │ PAST_DUE    │     │  PAUSED      │
        └──┬──────┬───┘     └──────────────┘
           │      │
    [retry succeeds] [max retries hit]
           │      │
           │      ▼
           │    ┌──────────┐
           │    │ CANCELED │
           │    └──────────┘
           │
           ▼
        ┌─────────────┐
        │   ACTIVE    │ ← back to normal
        └─────────────┘
           ...
           after 24 more months
           ▼
        ┌──────────┐
        │ EXPIRED  │ ← natural end
        └──────────┘
```

### **Invoice Lifecycle**

```
                created
                  │
                  ▼
        ┌──────────────────┐
        │   DRAFT/READY    │ ← not yet sent
        └────────┬─────────┘
                 │
            [send to customer]
                 │
                 ▼
        ┌──────────────────┐
        │    SENT/OPENED   │ ← customer saw it
        └─────┬────────┬───┘
              │        │
        [payment   [payment
         received]   failed]
              │        │
              ▼        ▼
        ┌──────────┐ ┌──────────┐
        │  PAID    │ │ PAST_DUE │
        └──────────┘ └─────┬────┘
                     [retry succeeds]
                           │
                           ▼
                      ┌──────────┐
                      │   PAID   │
                      └──────────┘
```

---

## 💡 Quick Reference: What Gets Created When?

| User Action | Tables Updated | Typical DB Rows Created |
|-------------|---|---|
| **Sign up** | users, user_roles | 2 |
| **Add address** | addresses | 1 |
| **Add payment method** | payment_methods | 1 |
| **Subscribe to plan** | subscriptions, invoices, invoice_items, payments | 4 |
| **Monthly renewal (auto)** | invoices, invoice_items, payments | 3 |
| **Cancel subscription** | subscriptions | 0 (UPDATE only) |
| **Failed payment retry** | payments | 1 |
| **Admin creates product** | products, plans, plan_features, audit_logs | ~6 |

---

Good luck with your hackathon! 🚀
