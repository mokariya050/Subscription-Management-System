# Database Schema Design
## Subscription E-Commerce Platform

---

## 📋 Entity Relationship Overview

```
                    ┌─────────────────────────────────────────┐
                    │    ACCOUNTS (Companies/Organizations)   │
                    │  - id, name, plan_tier, created_at      │
                    └────────┬────────────────────────────────┘
                             │
                         (owns many)
                             │
                    ┌────────▼───────────────────────────────┐
                    │    USERS (All People)                  │
                    │  - id, email, password_hash, acc_id    │
                    └────────┬───────────────────────────────┘
                             │
                    ┌────────┴────────────┬──────────────────┐
                    │                     │                  │
                    │              (has many)          (has many)
                    │                     │                  │
        ┌───────────▼─────────┐  ┌────────▼─────────┐  ┌────▼──────────────┐
        │  USER_ROLES         │  │ ADDRESSES        │  │ PAYMENT_METHODS   │
        │  - user_id, role    │  │ - id, user_id,   │  │ - id, user_id,    │
        │  [Admin, Manager,   │  │   address_type   │  │   provider, brand │
        │   Customer]         │  │   [billing,      │  │   [card, bank,    │
        └─────────────────────┘  │    shipping]     │  │    wallet]        │
                                 └──────────────────┘  └───────────────────┘
                                 
    ┌───────────────────────────────────────────────────────────────────┐
    │            PRODUCTS & SUBSCRIPTIONS FLOW                          │
    └───────────────────────────────────────────────────────────────────┘
    
    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │   PRODUCTS       │    │   PLANS          │    │  PLAN_FEATURES   │
    │ - id, name,      │    │ - id, name,      │    │ - plan_id,       │
    │   description,   │    │   price,         │    │   feature_id,    │
    │   base_price     │    │   interval       │    │   feature_value  │
    │ - type:          │    │ [monthly,yearly] │    │ (e.g. "5 users") │
    │  [product,       │    └──────────────────┘    └──────────────────┘
    │   subscription]  │
    └────────┬─────────┘
             │
        (customers choose)
             │
    ┌────────▼────────────────────┐
    │   SUBSCRIPTIONS             │
    │ - id, user_id, plan_id      │
    │ - status: [active, trial,   │
    │   paused, canceled, expired] │
    │ - current_period_start/end   │
    │ - trial_ends_at              │
    └────────┬────────────────────┘
             │
        (generates)
             │
    ┌────────▼────────────────────────┐
    │   INVOICES                       │
    │ - id, subscription_id, user_id   │
    │ - amount, status [open, paid]    │
    │ - period_start, period_end       │
    │ - due_date, paid_date            │
    └────────┬────────────────────────┘
             │
        (recorded by)
             │
    ┌────────▼──────────────────────────┐
    │   PAYMENTS                         │
    │ - id, invoice_id, payment_method_id
    │ - amount, status [succeeded,       │
    │   failed, pending, refunded]       │
    │ - provider [stripe, paypal]        │
    │ - provider_transaction_id          │
    └────────────────────────────────────┘

    ┌──────────────────────────────────┐
    │   AUDIT_LOGS (All Actions)       │
    │ - id, user_id, action, table,    │
    │   timestamp, old_value, new_value│
    └──────────────────────────────────┘
```

---

## 🗂️ Complete Table Structure

### **1. ACCOUNTS**
What: Companies or organizations in the system
Why: Multi-tenant support, each account can have multiple users
```
accounts
├── id (PK, BIGINT)
├── name (VARCHAR 100) - "Acme Corp"
├── slug (VARCHAR 50) - "acme-corp" [unique]
├── email_domain (VARCHAR 100) - "acme.com"
├── subscription_tier (ENUM) - [free, starter, professional, enterprise]
├── billing_contact_email (VARCHAR 190)
├── is_active (TINYINT) - 0/1
├── created_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [soft delete]
```

---

### **2. USERS**
What: Individual people who log in
Why: Authentication and profile management
```
users
├── id (PK, BIGINT)
├── account_id (FK → accounts.id)
├── email (VARCHAR 190) [UNIQUE] - "john@acme.com"
├── email_verified_at (DATETIME) - when email was confirmed
├── password_hash (VARCHAR 255) - bcrypt hash (NULL if OAuth only)
├── first_name (VARCHAR 100)
├── last_name (VARCHAR 100)
├── phone (VARCHAR 30) [NULLABLE]
├── oauth_provider (VARCHAR 50) [NULLABLE] - "google" for OAuth users
├── oauth_id (VARCHAR 120) [NULLABLE] - Google's unique user ID
├── last_login_at (DATETIME)
├── is_active (TINYINT) - inactive users can't login
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP) [soft delete]
```

---

### **3. USER_ROLES**
What: Maps users to roles (one user can have multiple roles)
Why: Role-based access control (RBAC)
```
user_roles
├── id (PK, BIGINT)
├── user_id (FK → users.id) [ON DELETE CASCADE]
├── role (ENUM) - "admin", "manager", "customer", "viewer"
├── granted_at (TIMESTAMP)
└── granted_by_user_id (FK → users.id) [WHO gave this role]

Permissions by role:
├─ admin: Full access, can create products, manage users, view all logs
├─ manager: Can manage assigned products/teams, no user/role management
├─ customer: Read-only their own data (subscriptions, invoices, addresses)
└─ viewer: Read-only product catalog, no account access
```

---

### **4. ADDRESSES**
What: Billing and shipping addresses for users
Why: E-commerce checkout, invoicing, shipping
```
addresses
├── id (PK, BIGINT)
├── user_id (FK → users.id) [ON DELETE CASCADE]
├── address_type (ENUM) - "billing", "shipping", "both"
├── first_name (VARCHAR 100)
├── last_name (VARCHAR 100)
├── company_name (VARCHAR 120)
├── street_address_1 (VARCHAR 200)
├── street_address_2 (VARCHAR 200) [NULLABLE]
├── city (VARCHAR 100)
├── state_province (VARCHAR 100)
├── postal_code (VARCHAR 20)
├── country_code (CHAR 2) - "US", "GB", etc.
├── phone (VARCHAR 30)
├── is_default (TINYINT) - default for billing/shipping
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP)
```

---

### **5. PAYMENT_METHODS**
What: Stored payment card details (MOCK - not real processing)
Why: Store billing info for checkout, no actual charges
```
payment_methods
├── id (PK, BIGINT)
├── user_id (FK → users.id) [ON DELETE CASCADE]
├── type (ENUM) - "credit_card", "debit_card"
├── card_number_last4 (CHAR 4) - "4242" [last 4 only, for display]
├── card_holder_name (VARCHAR 100)
├── exp_month (TINYINT) - 1-12
├── exp_year (SMALLINT) - 2025, 2026
├── is_default (TINYINT) - default payment for subscriptions
├── created_at (TIMESTAMP)
└── deleted_at (TIMESTAMP)
```

---

### **6. PRODUCTS**
What: Anything you sell (can be one-time purchase OR subscription base)
Why: Catalog of offerings
```
products
├── id (PK, BIGINT)
├── account_id (FK → accounts.id) [multi-account support]
├── sku (VARCHAR 50) [UNIQUE] - "PROD-001", "PRO-SUB-001"
├── name (VARCHAR 150) - "Professional Plan", "API Access"
├── description (TEXT)
├── product_type (ENUM) - "one_time_purchase", "subscription_base"
├── base_price_cents (INT UNSIGNED) - $99.99 = 9999 cents
├── currency (CHAR 3) - "USD", "EUR"
├── is_active (TINYINT)
├── is_featured (TINYINT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP)
```

---

### **7. PLANS**
What: Pricing tiers and recurrence rules for subscriptions
Why: Different billing intervals, trial periods, feature sets
```
plans
├── id (PK, BIGINT)
├── product_id (FK → products.id) [ON DELETE CASCADE]
├── name (VARCHAR 100) - "Monthly Professional"
├── description (TEXT) [NULLABLE]
├── price_cents (INT UNSIGNED) - $29/month = 2900 cents
├── currency (CHAR 3)
├── billing_interval (ENUM) - "monthly", "yearly", "weekly", "custom"
├── billing_interval_count (INT) - 1 for monthly, 12 for annual, etc.
├── trial_days (SMALLINT) - 0 or 14 or 30 (free trial)
├── setup_fee_cents (INT) [NULLABLE] - one-time setup cost
├── is_active (TINYINT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Usage example:
├─ Plan 1: $9/month, no trial
├─ Plan 2: $99/year (save 18%), 30-day trial
└─ Plan 3: $0.50/month (billed yearly), setup fee $9.99
```

---

### **8. PLAN_FEATURES**
What: Features included in each plan (e.g., "5 users", "API access")
Why: Let customers know exactly what they get per tier
```
plan_features
├── id (PK, BIGINT)
├── plan_id (FK → plans.id) [ON DELETE CASCADE]
├── feature_name (VARCHAR 120) - "User Seats", "API Access", "Support"
├── feature_value (VARCHAR 200) - "5 seats", "unlimited", "priority email"
├── sort_order (INT) - 1, 2, 3... for UI display
└── created_at (TIMESTAMP)
```

---

### **9. SUBSCRIPTIONS**
What: Active or past subscriptions for a user
Why: Track recurring billing, status (active/paused/canceled), renewal dates
```
subscriptions
├── id (PK, BIGINT)
├── account_id (FK → accounts.id)
├── user_id (FK → users.id)
├── plan_id (FK → plans.id)
├── payment_method_id (FK → payment_methods.id)
├── status (ENUM) - "trialing", "active", "past_due", "paused", "canceled", "expired"
├── current_period_start (DATETIME) - when current billing cycle began
├── current_period_end (DATETIME) - when next invoice is due
├── trial_starts_at (DATETIME) [NULLABLE]
├── trial_ends_at (DATETIME) [NULLABLE]
├── cancel_at_period_end (TINYINT) - user wants to cancel after current period
├── canceled_at (DATETIME) [NULLABLE]
├── cancellation_reason (VARCHAR 255) [NULLABLE]
├── ended_at (DATETIME) [NULLABLE]
├── metadata (JSON) [NULLABLE] - custom data like "purchased_for_project: xyz"
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP)
```

---

### **10. INVOICES**
What: Billing statements sent to customers
Why: Legal record, payment tracking, tax reporting
```
invoices
├── id (PK, BIGINT)internal accounting
```
invoices
├── id (PK, BIGINT)
├── account_id (FK → accounts.id)
├── user_id (FK → users.id)
├── subscription_id (FK → subscriptions.id) [NULLABLE, null for one-time]
├── invoice_number (VARCHAR 40) [UNIQUE] - "INV-2025-001234"
├── invoice_date (DATETIME)
├── period_start (DATETIME) - what time period does this invoice cover
├── period_end (DATETIME)
├── subtotal_cents (INT UNSIGNED) - before tax/discounts
├── discount_cents (INT) - negative value
├── tax_cents (INT UNSIGNED)
├── total_amount_cents (INT UNSIGNED)
├── amount_paid_cents (INT UNSIGNED) - how much has been paid so far
├── amount_due_cents (INT UNSIGNED) - still owes
├── currency (CHAR 3)
├── status (ENUM) - "draft", "ready", "sent", "opened", "paid", "past_due", "void", "refunded"
├── due_date (DATETIME)
├── paid_at (DATETIME) [NULLABLE]
├── billing_address_id (FK → addresses.id)
├── notes (TEXT) [NULLABL
```

---

### **11. INVOICE_ITEMS**
What: Line items on each invoice
Why: Itemized breakdown (plan charge, add-ons, credits, tax)
```
invoice_items
├── id (PK, BIGINT)
├── invoice_id (FK → invoices.id) [ON DELETE CASCADE]
├── description (VARCHAR 255) - "Professional Plan (Monthly)"
├── quantity (INT) - usually 1 for subscriptions
├── unit_price_cents (INT UNSIGNED)
├── amount_cents (INT UNSIGNED)
├── item_type (ENUM) - "charge", "credit", "tax", "addon"
└── created_at (TIMESTAMP)
```

---

### **12. PAYMENTS**
What: Actual charges to payment methods
Why: Transaction history, retry logic, reconciliation
```
payments
├── id (PK, BIGINT)
├── inPayment transaction records (MOCK - demo only)
Why: Track billing attempts, success/failure status
```
payments
├── id (PK, BIGINT)
├── invoice_id (FK → invoices.id)
├── user_id (FK → users.id)
├── payment_method_id (FK → payment_methods.id)
├── amount_cents (INT UNSIGNED)
├── currency (CHAR 3)
├── status (ENUM) - "pending", "succeeded", "failed"
├── transaction_ref (VARCHAR 120) - internal reference ID
├── failure_reason (VARCHAR 255) [NULLABLE]
├── paid_at (DATETIME) [NULLABLE]
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Note: This is MOCK payment processing
- No real charges, no payment gateway integration
- For demo/testing purposes only
- Status always succeeds (or fails based on test rules
What: System audit trail - who did what when
Why: Compliance, security, debugging, accountability
```
audit_logs
├── id (PK, BIGINT)
├── account_id (FK → accounts.id)
├── user_id (FK → users.id) [NULLABLE, system events have NULL]
├── action (VARCHAR 100) - "create_subscription", "payment_failed", "invoice_generated"
├── table_name (VARCHAR 100) - "subscriptions", "payments", "users"
├── record_id (BIGINT)
├── old_value (JSON) [NULLABLE] - before state
├── new_value (JSON) [NULLABLE] - after state
├── ip_address (VARCHAR 45)
├── user_agent (TEXT) [NULLABLE]
├── status (ENUM) - "success", "failed"
├── error_message (TEXT) [NULLABLE]
├── created_at (TIMESTAMP)
└── INDEX (account_id, created_at) [for fast audit queries]
```

---

## 🔗 Key Relationships

| From | To | Type | Cascade? | Purpose |
|------|----|----|---------|---------|
| accounts → users | 1:N | parent-child | RESTRICT | Each account has many users |
| users → user_roles | 1:N | one-to-many | CASCADE on DELETE | User can have multiple roles |
| users → addresses | 1:N | one-to-many | CASCADE | Multiple addresses per user |
| users → payment_methods | 1:N | one-to-many | CASCADE | Multiple payment cards |
| users → subscriptions | 1:N | one-to-many | RESTRICT | User owns subscriptions |
| products → plans | 1:N | one-to-many | CASCADE | Product has multiple price tiers |
| plans → plan_features | 1:N | one-to-many | CASCADE | Features per plan |
| plans → subscriptions | 1:N | one-to-many | RESTRICT | Plan can have many active subscribers |
| subscriptions → invoices | 1:N | one-to-many | CASCADE | Auto-generate invoices |
| invoices → invoice_items | 1:N | one-to-many | CASCADE | Itemized line items |
| invoices → payments | 1:N | one-to-many | CASCADE | Multi-partial payments allowed |

---

## 📊 Query Examples (Your Backend Will Use These)

### Get user with all subscriptions
```sql
SELECT u.*, s.* 
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.id = ? AND s.status = 'active'
```

### Auto-generate invoice and payment (Background Job)
```sql
-- Find subscriptions ending today
SELECT s.* FROM subscriptions s 
WHERE s.status = 'active' 
AND s.current_period_end = CURDATE()

-- Create invoice
INSERT INTO invoices (subscription_id, user_id, total_amount_cents, status, due_date)
VALUES (?, ?, plan_price, 'open', DATE_ADD(NOW(), INTERVAL 7 DAY))

-- Record payment attempt
INSERT INTO payments (invoice_id, payment_method_id, amount_cents, status, provider)
VALUES (?, ?, plan_price, 'pending', 'stripe')
```

---

## ⚡ Performance Optimizations

Indexes created for:
- `users.email` (UNIQUE) - fast login lookups
- `subscriptions.user_id` - find user's subscriptions
- `subscriptions.status` - find active subscriptions for billing
- `invoices.subscription_id` - find invoices for subscription
- `payments.status` - find failed payments to retry
- `audit_logs.account_id, audit_logs.created_at` - fast audit retrieval

---

## 🎯 MVP vs Enterprise Schema Difference

**MVP (20-hour hackathon)**: Use all 13 tables as-is
**Enterprise additions** (later versions):
- `discounts` / `coupons` table for promotional codes
- `refunds` table for detailed refund tracking
- `webhooks` + `webhook_logs` for event notifications
- `usage_events` for metered billing (pay-per-unit)
- `tax_rates` for multi-region tax handling
- `customers` as separate entity from users (B2B support)

---

Good luck building! 🚀
