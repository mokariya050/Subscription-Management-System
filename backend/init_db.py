#!/usr/bin/env python
"""Initialize database with sample data"""
import os
import sys
from datetime import datetime, timedelta
from app import create_app, db
from app.models import (
    Account, User, UserRole, Product, Plan, PlanFeature,
    Subscription, Invoice, InvoiceItem
)
from app.utils import hash_password

def init_db():
    """Initialize database with sample data"""
    app = create_app('development')
    
    with app.app_context():
        # Drop all tables
        print("Dropping existing tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating tables...")
        db.create_all()
        
        # Create sample account
        print("\nCreating sample account...")
        account = Account(
            id=1,
            name='Acme Corporation',
            slug='acme-corp',
            email_domain='acme.com',
            subscription_tier='professional',
            billing_contact_email='billing@acme.com',
            is_active=True
        )
        db.session.add(account)
        db.session.flush()
        
        # Create sample users
        print("Creating sample users...")
        admin_user = User(
            account_id=account.id,
            email='admin@acme.com',
            password_hash=hash_password('password123'),
            first_name='Admin',
            last_name='User',
            phone='+1-555-0001',
            is_active=True
        )
        db.session.add(admin_user)
        db.session.flush()
        
        customer_user = User(
            account_id=account.id,
            email='customer@acme.com',
            password_hash=hash_password('password123'),
            first_name='John',
            last_name='Doe',
            phone='+1-555-0002',
            is_active=True
        )
        db.session.add(customer_user)
        db.session.flush()
        
        # Assign roles
        print("Assigning roles...")
        admin_role = UserRole(user_id=admin_user.id, role='admin')
        db.session.add(admin_role)
        
        customer_role = UserRole(user_id=customer_user.id, role='customer')
        db.session.add(customer_role)
        db.session.flush()
        
        # Create sample products
        print("Creating sample products...")
        product1 = Product(
            name='Cloud Storage Pro',
            slug='cloud-storage-pro',
            description='Professional cloud storage solution',
            product_type='subscription',
            base_price_cents=9999,  # $99.99
            currency='USD',
            is_active=True
        )
        db.session.add(product1)
        db.session.flush()
        
        product2 = Product(
            name='Analytics Suite',
            slug='analytics-suite',
            description='Advanced analytics and reporting',
            product_type='subscription',
            base_price_cents=19999,  # $199.99
            currency='USD',
            is_active=True
        )
        db.session.add(product2)
        db.session.flush()
        
        # Create sample plans
        print("Creating sample plans...")
        plan1 = Plan(
            product_id=product1.id,
            name='Starter Monthly',
            description='100GB storage, 3 users',
            price_cents=4999,  # $49.99
            currency='USD',
            interval='monthly',
            interval_count=1,
            trial_days=7,
            is_active=True
        )
        db.session.add(plan1)
        db.session.flush()
        
        plan2 = Plan(
            product_id=product1.id,
            name='Pro Monthly',
            description='Unlimited storage, unlimited users',
            price_cents=9999,  # $99.99
            currency='USD',
            interval='monthly',
            interval_count=1,
            trial_days=14,
            is_active=True
        )
        db.session.add(plan2)
        db.session.flush()
        
        plan3 = Plan(
            product_id=product2.id,
            name='Analytics Pro Yearly',
            description='Full analytics suite',
            price_cents=199999,  # $1999.99/year
            currency='USD',
            interval='yearly',
            interval_count=1,
            trial_days=30,
            is_active=True
        )
        db.session.add(plan3)
        db.session.flush()
        
        # Add features to plans
        print("Adding plan features...")
        features1 = [
            PlanFeature(plan_id=plan1.id, feature_name='Storage', feature_value='100GB'),
            PlanFeature(plan_id=plan1.id, feature_name='Users', feature_value='3'),
            PlanFeature(plan_id=plan1.id, feature_name='Support', feature_value='Email'),
        ]
        db.session.add_all(features1)
        
        features2 = [
            PlanFeature(plan_id=plan2.id, feature_name='Storage', feature_value='Unlimited'),
            PlanFeature(plan_id=plan2.id, feature_name='Users', feature_value='Unlimited'),
            PlanFeature(plan_id=plan2.id, feature_name='Support', feature_value='24/7 Priority'),
        ]
        db.session.add_all(features2)
        
        features3 = [
            PlanFeature(plan_id=plan3.id, feature_name='Analytics', feature_value='Full'),
            PlanFeature(plan_id=plan3.id, feature_name='Reports', feature_value='Custom'),
            PlanFeature(plan_id=plan3.id, feature_name='Data Export', feature_value='Yes'),
        ]
        db.session.add_all(features3)
        db.session.flush()
        
        # Create sample subscription
        print("Creating sample subscription...")
        now = datetime.utcnow()
        subscription = Subscription(
            account_id=account.id,
            user_id=customer_user.id,
            plan_id=plan1.id,
            payment_method_id=None,
            status='active',
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
            trial_starts_at=now,
            trial_ends_at=now + timedelta(days=7),
            created_at=now
        )
        db.session.add(subscription)
        db.session.flush()
        
        # Create sample invoice
        print("Creating sample invoice...")
        invoice = Invoice(
            account_id=account.id,
            user_id=customer_user.id,
            subscription_id=subscription.id,
            invoice_number='INV-2025-000001',
            invoice_date=now,
            period_start=now,
            period_end=now + timedelta(days=30),
            subtotal_cents=4999,
            discount_cents=0,
            tax_cents=425,  # 8.5% tax
            total_amount_cents=5424,
            amount_due_cents=5424,
            currency='USD',
            status='draft',
            due_date=now + timedelta(days=7),
            created_at=now
        )
        db.session.add(invoice)
        db.session.flush()
        
        # Add invoice items
        print("Adding invoice items...")
        item1 = InvoiceItem(
            invoice_id=invoice.id,
            description='Cloud Storage Pro - Starter Monthly (1 month)',
            quantity=1,
            unit_price_cents=4999,
            amount_cents=4999,
            item_type='charge'
        )
        db.session.add(item1)
        
        item2 = InvoiceItem(
            invoice_id=invoice.id,
            description='Tax (8.5%)',
            quantity=1,
            unit_price_cents=425,
            amount_cents=425,
            item_type='tax'
        )
        db.session.add(item2)
        db.session.flush()
        
        # Commit all changes
        print("\nCommitting changes...")
        db.session.commit()
        
        print("\n✅ Database initialized successfully!")
        print("\nSample Data Created:")
        print(f"  Account: {account.name} (ID: {account.id})")
        print(f"  Admin User: {admin_user.email} (Password: password123)")
        print(f"  Customer User: {customer_user.email} (Password: password123)")
        print(f"  Products: {product1.name}, {product2.name}")
        print(f"  Plans: {plan1.name}, {plan2.name}, {plan3.name}")
        print(f"  Subscription: {subscription.id}")
        print(f"  Invoice: {invoice.invoice_number}")
        print("\n📝 You can now login with:")
        print("  Email: admin@acme.com or customer@acme.com")
        print("  Password: password123")


if __name__ == '__main__':
    try:
        init_db()
    except Exception as e:
        print(f"\n❌ Error initializing database: {str(e)}")
        sys.exit(1)
