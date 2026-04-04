# Subscription Management E-Commerce Platform
## Hackathon Project (20 Hours)

---

## 🎯 Problem Statement

Modern businesses need a unified platform to:
- **Sell products & services** with flexible recurring billing options
- **Manage multiple subscription plans** (monthly, yearly, pay-as-you-go)
- **Handle user authentication** securely (email/password + OAuth)
- **Track revenue** with invoicing and payment records
- **Control access** through role-based permissions
- **Scale efficiently** without rewriting the database layer

Current solutions are fragmented (Stripe for billing, Auth0 for auth, Shopify for products). We're building an **all-in-one platform**.

---

## 👥 User Personas

### 1. **Admin/Owner**
- Creates and manages products & subscription plans
- Views financial reports, invoices, and payment logs
- Manages user roles and permissions
- Monitors system health via audit logs

### 2. **Business Manager**
- Can view assigned products and sales metrics
- Cannot delete or modify core system settings
- Manages team members with limited scope

### 3. **End User / Customer**
- Signs up via email or Google OAuth
- Browses products and subscription plans
- Adds items to cart and completes checkout
- Manages multiple addresses and payment methods
- Views subscription status and invoices
- Downloads receipts and billing history

### 4. **Subscription Service System** (backend)
- Automatically generates invoices
- Processes recurring payments
- Updates subscription statuses (active → expired → renewed)
- Sends webhooks and notifications

---

## 📊 Core Features (MVP)

| Feature | Purpose | Hackathon Scope |
|---------|---------|-----------------|
| **Authentication** | Email/password + Google OAuth login | Both email and Google OAuth |
| **Product Catalog** | List and manage products | Store products with pricing |
| **Shopping Cart** | Add items before checkout | Session-based, stored in DB |
| **Subscriptions** | Recurring billing cycles | Monthly/yearly plans |
| **Invoicing** | Track revenue and payments | Auto-generate per billing cycle |
| **Roles & Permissions** | Control user access | 3 roles: Admin, Manager, Customer |
| **Audit Logs** | Track all changes | Log all critical actions |
| **Payment Methods** | Store simple payment info | Mock processor (no real charges) |
| **Address Management** | Billing & shipping addresses | Multi-address support |

---

## 🏗️ System Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │    Frontend (React)                 │
                    │  - Product Catalog                  │
                    │  - Shopping Cart                    │
                    │  - Checkout & Payment Form          │
                    │  - User Dashboard                   │
                    │  - Admin Panel                      │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────┴──────────────────┐
                    │  Flask REST API                 │
                    │  - /auth (login, signup)        │
                    │  - /products (CRUD)             │
                    │  - /subscriptions (manage)      │
                    │  - /invoices (view, download)   │
                    │  - /payments (mock processor)   │
                    │  - /admin (management)          │
                    └──────────────┬──────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
    ┌───▼────────────┐  ┌─────────▼─────────┐      ┌────────▼──────────┐
    │  Auth (JWT)    │  │  MySQL Database   │      │  Background Tasks │
    │  - Password    │  │  (Your Schema)    │      │  (Celery/APScheduler)
    │    hashing     │  │                   │      │  - Invoice gen    │
    │  - Session mgmt│  │                   │      │  - Payment retry  │
    └────────────────┘  └───────────────────┘      └───────────────────┘
                                 │
                    ✓ All built from scratch
                    ✓ No external APIs
                    ✓ Mock payment processing
                    ✓ Pure Flask + React + MySQL
```

---

## 💾 Database Layer (Your Focus)

The schema supports:

1. **Multi-tenant readiness** (accounts can have multiple users with roles)
2. **Audit trails** (who did what and when)
3. **Recurring billing** (automatic invoice generation)
4. **Payment tracking** (from pending → paid → failed → refunded)
5. **Scalability** (proper indexing, foreign keys, partitioning-ready)

---

## 🔄 User Journey Examples

### Journey 1: Sign Up & Subscribe
```
1. User opens app → Sees "Sign Up" button
2. User has two options:
   a. Email + Password signup
   b. "Sign in with Google" (OAuth)
3. If email/password:
   - System hashes password (bcrypt) and creates user record
4. If Google OAuth:
   - Flask redirects to Google login
   - User grants permission
   - Google returns user_id + email
   - System stores oauth_provider='google' and oauth_id
5. User assigned default role: "Customer"
6. User redirected to product catalog
7. User browses products and subscription plans
8. User selects "Professional Plan (Monthly)" → Added to cart
9. User proceeds to checkout
10. User enters address (billing)
11. User enters card details (MOCK - no real charge)
12. System creates invoice + records payment (status='succeeded')
13. User subscription marked as "active"
14. Dashboard shows confirmation
15. Every month: System auto-generates new invoice + mock charges payment
```

### Journey 2: Admin Manages Products
```
1. Admin logs in with email/password
2. System verifies admin role from "user_roles" table
3. Admin navigates to "Products" page
4. Admin clicks "Create New Product"
5. Admin fills form (name, description, price, recurring interval)
6. System stores in "products" table
7. Admin associates "features" (e.g., "API Access", "Support")
8. Admin publishes product
9. Product appears in customer catalog
10. System logs action in "audit_logs" table
```

### Journey 3: Payment Processing (Auto-Billing)
```
Background Job runs every hour:
1. Query all subscriptions with status="active" AND current_period_end <= NOW()
2. For each subscription:
   a. Create new invoice record
   b. Charge payment method (via Stripe/PayPal)
   c. If payment succeeded: mark invoice "paid" + extend subscription period
   d. If payment failed: mark invoice "past_due" + send reminder email
   e. Log action in audit_logs
```

---

## ⚡ 20-Hour Hackathon Breakdown

### **Phase 1: Database Design (Hours 0-2)**
✅ Create MySQL schema (provided)
✅ Create ER diagram
✅ Document table relationships

### **Phase 2: Backend API (Hours 2-10)**
- User authentication endpoints (signup, login, OAuth)
- Product CRUD endpoints
- Cart management endpoints
- Subscription creation & management
- Invoice retrieval endpoints
- Admin role endpoints

### **Phase 3: Frontend UI (Hours 10-18)**
- Login & signup pages
- Product catalog browsing
- Shopping cart
- Checkout flow
- Dashboard (subscriptions, invoices, address book)
- Admin panel (create products, view metrics)

### **Phase 4: Refinement & Testing (Hours 18-20)**
- Bug fixes
- Demo preparation
- Documentation

---

## 📈 Scalability Roadmap (Post-Hackathon)

| Phase | Enhancement | Effort |
|-------|-------------|--------|
| **MVP (Now)** | Single product, basic auth, manual payments | Complete |
| **Phase 2** | Multi-currency, coupon codes, discount rules | 1-2 weeks |
| **Phase 3** | Referral program, affiliate tracking, analytics | 2-3 weeks |
| **Phase 4** | White-label platform, API for third-party integrations | 3-4 weeks |
| **Enterprise** | Advanced billing (usage-based), compliance (GDPR), multi-region | Ongoing |

---
Built from Scratch)

✅ **Password Security**: Hashed passwords (bcrypt) in `password_hash`  
✅ **PII Protection**: Email indexed for uniqueness, phone optional  
✅ **Audit Trail**: Every change logged with timestamps  
✅ **Role-Based Access**: `user_roles` table enforces permissions (Flask middleware)  
✅ **JWT Tokens**: Session management with signed tokens  
✅ **Soft Deletes**: Timestamps track lifecycle (created_at, deleted_at)  
✅ **Foreign Key Constraints**: Data integrity enforced at DB level  
✅ **Mock Payments**: No real payment processing (safe for demo)vel  
✅ **Tokenization**: Payment tokens stored, not raw card numbers  

---

## 📊 Key Metrics to Track

By end of hackathon, measure:
- **User signups**: Total accounts created
- **Subscription activation rate**: Users who complete first purchase
- **Payment success rate**: % of charges that succeed
- **Daily recurring revenue (DRR)**: Total active subscriptions × plan price / 30
- **Churn rate**: % of users who cancel subscriptions
- **API response time**: < 200ms for critical endpoints

---

## 🎬 Next Steps

1. **Review the schema** (`schema.sql`)
2. **Understand table relationships** (ER diagram in `SCHEMA_DESIGN.md`)
3. **Start coding** the REST API endpoints
4. **Build the frontend** UI
5. **Test end-to-end** (signup → subscribe → get invoice)
6. **Deploy** to staging environment

Good luck! 🚀
