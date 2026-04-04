-- ============================================================================
-- SUBSCRIPTION MANAGEMENT E-COMMERCE PLATFORM
-- MySQL 8.0+ Schema
-- For: 20-Hour Odoo Hackathon
-- Stack: Flask (Backend) + React (Frontend) + MySQL (Database)
-- Key: NO external services, all built from scratch
-- ============================================================================

CREATE DATABASE IF NOT EXISTS subscription_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE subscription_platform;

-- ============================================================================
-- 1. ACCOUNTS (Multi-tenant organizations)
-- ============================================================================
CREATE TABLE accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  email_domain VARCHAR(100),
  subscription_tier ENUM('free','starter','professional','enterprise') NOT NULL DEFAULT 'free',
  billing_contact_email VARCHAR(190),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_accounts_slug (slug),
  KEY idx_accounts_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- 2. USERS (All people in the system)
-- ============================================================================
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(190) NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(30),
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(120),
  last_login_at TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_users_email (email),
  KEY idx_users_account_id (account_id),
  KEY idx_users_oauth (oauth_provider, oauth_id),
  KEY idx_users_created_at (created_at),
  CONSTRAINT fk_users_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 3. USER_ROLES (RBAC - Role-Based Access Control)
-- ============================================================================
CREATE TABLE user_roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('admin','manager','customer','viewer') NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by_user_id BIGINT UNSIGNED,
  KEY idx_user_roles_user (user_id),
  KEY idx_user_roles_role (role),
  UNIQUE KEY uq_user_roles_user_role (user_id, role),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_roles_granted_by
    FOREIGN KEY (granted_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 4. ADDRESSES (Billing & Shipping)
-- ============================================================================
CREATE TABLE addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  address_type ENUM('billing','shipping','both') NOT NULL DEFAULT 'both',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(120),
  street_address_1 VARCHAR(200) NOT NULL,
  street_address_2 VARCHAR(200),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country_code CHAR(2) NOT NULL,
  phone VARCHAR(30),
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_addresses_user_id (user_id),
  KEY idx_addresses_type (address_type),
  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 5. PAYMENT_METHODS (Stored payment instruments)
-- ============================================================================
CREATE TABLE payment_methods (
  id BIGINT UNSIGNED AUMock payment cards for testing)
-- ============================================================================
CREATE TABLE payment_methods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('credit_card','debit_card') NOT NULL DEFAULT 'credit_card',
  card_holder_name VARCHAR(100),
  card_number_last4 CHAR(4),
  exp_month TINYINT UNSIGNED,
  exp_year SMALLINT UNSIGNED,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_payment_methods_user_id (user_id),
  KEY idx_payment_methods_default (is_default
) ENGINE=InnoDB;

-- ============================================================================
-- 6. PRODUCTS (What you sell)
-- ============================================================================
CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT UNSIGNED NOT NULL,
  sku VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description LONGTEXT,
  product_type ENUM('one_time_purchase','subscription_base') NOT NULL DEFAULT 'subscription_base',
  base_price_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_products_account_id (account_id),
  KEY idx_products_sku (sku),
  KEY idx_products_status (is_active),
  UNIQUE KEY uq_products_account_sku (account_id, sku),
  CONSTRAINT fk_products_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 7. PLANS (Pricing tiers with billing intervals)
-- ============================================================================
CREATE TABLE plans (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  billing_interval ENUM('daily','weekly','monthly','yearly','custom') NOT NULL DEFAULT 'monthly',
  billing_interval_count INT NOT NULL DEFAULT 1,
  trial_days SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  setup_fee_cents INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_plans_product_id (product_id),
  KEY idx_plans_status (is_active),
  CONSTRAINT fk_plans_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 8. PLAN_FEATURES (What's included in each plan)
-- ============================================================================
CREATE TABLE plan_features (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id BIGINT UNSIGNED NOT NULL,
  feature_name VARCHAR(120) NOT NULL,
  feature_value VARCHAR(200),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_plan_features_plan_id (plan_id),
  CONSTRAINT fk_plan_features_plan
    FOREIGN KEY (plan_id) REFERENCES plans(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 9. SUBSCRIPTIONS (User's active subscriptions)
-- ============================================================================
CREATE TABLE subscriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  payment_method_id BIGINT UNSIGNED,
  status ENUM('trialing','active','past_due','paused','canceled','expired') NOT NULL DEFAULT 'trialing',
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  trial_starts_at DATETIME,
  trial_ends_at DATETIME,
  cancel_at_period_end TINYINT(1) NOT NULL DEFAULT 0,
  canceled_at DATETIME,
  cancellation_reason VARCHAR(255),
  ended_at DATETIME,
  provider VARCHAR(50),
  provider_subscription_id VARCHAR(120),
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_subscriptions_account_id (account_id),
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_subscriptions_account_id (account_id),
  KEY idx_subscriptions_user_id (user_id),
  KEY idx_subscriptions_plan_id (plan_id),
  KEY idx_subscriptions_status (status),
  KEY idx_subscriptions_period_end (current_period_en
    FOREIGN KEY (plan_id) REFERENCES plans(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_subscriptions_payment_method
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 10. INVOICES (Billing statements)
-- ============================================================================
CREATE TABLE invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED,
  invoice_number VARCHAR(40) NOT NULL,
  invoice_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  subtotal_cents INT UNSIGNED NOT NULL,
  discount_cents INT NOT NULL DEFAULT 0,
  tax_cents INT UNSIGNED NOT NULL DEFAULT 0,
  total_amount_cents INT UNSIGNED NOT NULL,
  amount_paid_cents INT UNSIGNED NOT NULL DEFAULT 0,
  amount_due_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('draft','ready','sent','opened','paid','past_due','void','refunded') NOT NULL DEFAULT 'open',
  due_date DATETIME,
  paid_at DATETIME,
  billing_address_id BIGINT UNSIGNED,
  notes TEXT,
  provider VARCHAR(50),
  provider_invoice_id VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_invoices_account_id (account_id),
  KEY idx_invoices_user_id (user_id),
  KEY idx_invoices_subscription_id (subscription_id),
  KEY idx_invoices_number (invoice_number),
  KEY idx_invoices_status (status),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  KEY idx_invoices_account_id (account_id),
  KEY idx_invoices_user_id (user_id),
  KEY idx_invoices_subscription_id (subscription_id),
  KEY idx_invoices_number (invoice_number),
  KEY idx_invoices_status (status),
  KEY idx_invoices_period_start (period_start
    FOREIGN KEY (billing_address_id) REFERENCES addresses(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 11. INVOICE_ITEMS (Line items on invoices)
-- ============================================================================
CREATE TABLE invoice_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents INT UNSIGNED NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  item_type ENUM('charge','credit','tax','addon') NOT NULL DEFAULT 'charge',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_invoice_items_invoice_id (invoice_id),
  CONSTRAINT fk_invoice_items_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 12. PAYMENTS (Payment transactions)
-- ============================================================================
CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  payment_method_id BIGINT UNSIGNED,
  amount_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending','processing','succeeded','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
  provider VARCHAR(50) NOT NULL,
  provider_payment_id VARCHAR(120),
  provider_payout_id VARCHAR(120),
  transaction_refMock payment processing - no real charges)
-- ============================================================================
CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  payment_method_id BIGINT UNSIGNED,
  amount_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending','succeeded','failed') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(120),
  failure_reason VARCHAR(255),
  paid_at DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_invoice_id (invoice_id),
  KEY idx_payments_user_id (user_id),
  KEY idx_payments_status (status
-- ============================================================================
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id BIGINT UNSIGNED,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status ENUM('success','failed') NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_logs_account_created (account_id, created_at),
  KEY idx_audit_logs_user_id (user_id),
  KEY idx_audit_logs_action (action),
  KEY idx_audit_logs_table (table_name),
  KEY idx_audit_logs_created_at (created_at),
  CONSTRAINT fk_audit_logs_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- SAMPLE DATA (For testing)
-- ============================================================================

-- Create sample account
INSERT INTO accounts (name, slug, subscription_tier, created_at)
VALUES ('Acme Corp', 'acme-corp', 'professional', NOW());

-- Create sample user
INSERT INTO users (account_id, email, password_hash, first_name, last_name, is_active, created_at)
VALUES (
  1,
  'john@acme.com',
  '$2y$10$abcdef123456789...',  -- bcrypt hash of "password123"
  'John',
  'Doe',
  1,
  NOW()
);

-- Assign admin role
INSERT INTO user_roles (user_id, role, created_at)
VALUES (1, 'admin', NOW());

-- Create sample address
INSERT INTO addresses (user_id, address_type, first_name, last_name, street_address_1, city, postal_code, country_code, created_at)
VALUES (
  1,
  'both',
  'John',
  'Doe',
  '123 Main Street',
  'New York',
  '10001',
  'US',
  NOW()
);

-- Create sample product
INSERT INTO products (account_id, sku, name, base_price_cents, product_type, is_active, created_at)
VALUES (
  1,
  'PRO-001',
  'Professional Plan',
  2999,  -- $29.99
  'subscription_base',
  1,
  NOW()
);

-- Create sample plan
INSERT INTO plans (product_id, name, price_cents, billing_interval, trial_days, is_active, created_at)
VALUES (
  1,
  'Monthly Professional',
  2999,  -- $29.99/month
  'monthly',
  14,  -- 14 day trial
  1,
  NOW()
);

-- Add features to plan
INSERT INTO plan_features (plan_id, feature_name, feature_value, sort_order, created_at)
VALUES
  (1, 'Users', '5 seats', 1, NOW()),
  (1, 'API Access', 'Unlimited', 2, NOW()),
  (1, 'Support', 'Priority Email', 3, NOW());

-- Create sample payment method
INSERT INTO payment_methods (user_id, provider, type, brand, last4, exp_month, exp_year, provider_payment_method_id, is_default, created_at)
VALUES (
  1,
  'stripe',
  'card',
  'VISA',
  '4242',
  12,
  2026,
  'pm_1234567890...',
  1,
  NOW()
);

-- Create sample subscription
INSERT INTO subscriptions (account_id, user_id, plan_id, payment_method_id, status, current_period_start, current_period_end, trial_starts_at, trial_ends_at, created_at)
VALUES (
  1,
  1,
  1,
  1,
  'trialing',
  NOW(),
  DATE_ADD(NOW(), INTERVAL 1 MONTH),
  NOW(),
  DATE_ADD(NOW(), INTERVAL 14 DAY),
  NOW()
);

-- Create sample invoice
INSERT INTO invoices (account_id, user_id, subscription_id, invoice_number, invoice_date, period_start, period_end, subtotal_cents, tax_cents, total_amount_cents, amount_due_cents, currency, status, due_date, created_at)
VALUES (
  1,
  1,
  1,
  'INV-2025-001',
  NOW(),
  NOW(),
  DATE_ADD(NOW(), INTERVAL 1 MONTH),
  2999,
  450,  -- Tax
  3449,
  3449,
  'USD',
  'open',
  DATE_ADD(NOW(), INTERVAL 7 DAY),
  NOW()
);

-- Add invoice item
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price_cents, amount_cents, item_type, created_at)
VALUES (
  1,
  'Professional Plan (Monthly)',
  1,
  2999,
  2999,
  'charge',
  NOW()
);

-- Log audit entry
INSERT INTO audit_logs (account_id, user_id, action, table_name, record_id, new_value, status, created_at)
VALUES (
  1,
  1,
  'create_subscription',
  'subscriptions',
  1,
  JSON_OBJECT('user_id', 1, 'plan_id', 1, 'status', 'trialing'),
  'success',
  NOW()
);

-- ============================================================================
-- FILE UPLOAD EXTENSION: PRODUCT IMAGES
-- Mirrors backend ProductImage model used by actual product photo upload APIs.
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_product_images_product_id (product_id),
  KEY idx_product_images_sort_order (sort_order),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Tables: 14
-- Relationships: All enforced via FOREIGN KEYS
-- Indexes: Optimized for common queries
-- Sample Data: Basic test data included
-- Ready for: REST API development, background job processing
-- ============================================================================
