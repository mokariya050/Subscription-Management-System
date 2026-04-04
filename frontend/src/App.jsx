import { Navigate, Route, Routes } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen'
import SignUpScreen from './screens/SignUpScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import CustomerHomeScreen from './screens/CustomerHomeScreen'
import CustomerShopScreen from './screens/CustomerShopScreen'
import CustomerProductScreen from './screens/CustomerProductScreen'
import CustomerCartScreen from './screens/CustomerCartScreen'
import CustomerOrderSuccessScreen from './screens/CustomerOrderSuccessScreen'
import CustomerProfileScreen from './screens/CustomerProfileScreen'
import CustomerOrdersScreen from './screens/CustomerOrdersScreen'
import CustomerOrderDetailScreen from './screens/CustomerOrderDetailScreen'
import CustomerInvoiceScreen from './screens/CustomerInvoiceScreen'
import SplashLoadingScreen from './screens/SplashLoadingScreen'
import SplashSuccessScreen from './screens/SplashSuccessScreen'
import SplashErrorScreen from './screens/SplashErrorScreen'
import HomeScreen from './screens/HomeScreen'
import SubscriptionOtherInfoScreen from './screens/SubscriptionOtherInfoScreen'
import QuotationSentScreen from './screens/QuotationSentScreen'
import DraftInvoiceScreen from './screens/DraftInvoiceScreen'
import NewInvoiceScreen from './screens/NewInvoiceScreen'
import NewInvoicePaymentScreen from './screens/NewInvoicePaymentScreen'
import InvoicesScreen from './screens/InvoicesScreen'
import SubscriptionDetailScreen from './screens/SubscriptionDetailScreen'
import UserDetailScreen from './screens/UserDetailScreen'
import ContactDetailScreen from './screens/ContactDetailScreen'
import ContactsScreen from './screens/ContactsScreen'
import ProductsScreen from './screens/ProductsScreen'
import ProductNewScreen from './screens/ProductNewScreen'
import ProductDetailScreen from './screens/ProductDetailScreen'
import ConfigurationScreen from './screens/ConfigurationScreen'
import RecurringPlanDetailScreen from './screens/RecurringPlanDetailScreen'
import AttributeDetailScreen from './screens/AttributeDetailScreen'
import QuotationTemplateScreen from './screens/QuotationTemplateScreen'
import TaxDetailScreen from './screens/TaxDetailScreen'
import VariantDetailScreen from './screens/VariantDetailScreen'
import PaymentTermDetailScreen from './screens/PaymentTermDetailScreen'
import DiscountDetailScreen from './screens/DiscountDetailScreen'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Splash Screens */}
            <Route path="/internal/splash/loading" element={<SplashLoadingScreen />} />
            <Route path="/internal/splash/success" element={<SplashSuccessScreen />} />
            <Route path="/internal/splash/error" element={<SplashErrorScreen />} />

            {/* Customer Auth Screens */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/customer/home" element={<CustomerHomeScreen />} />
            <Route path="/customer/shop" element={<CustomerShopScreen />} />
            <Route path="/customer/products/:productId" element={<CustomerProductScreen />} />
            <Route path="/customer/cart" element={<CustomerCartScreen />} />
            <Route path="/customer/profile" element={<CustomerProfileScreen />} />
            <Route path="/customer/orders" element={<CustomerOrdersScreen />} />
            <Route path="/customer/orders/:orderId" element={<CustomerOrderDetailScreen />} />
            <Route path="/customer/orders/:orderId/invoice" element={<CustomerInvoiceScreen />} />
            <Route path="/customer/orders/:orderId/success" element={<CustomerOrderSuccessScreen />} />

            {/* Internal Auth Screens */}
            <Route path="/internal/login" element={<LoginScreen
                audience="internal"
                appLabel="SubSync Internal"
                heading="Internal sign in"
                subheading="Use your employee credentials to continue."
                forgotPasswordPath="/internal/forgot-password"
                signUpPath="/internal/signup"
                signUpLabel="Request access"
                signUpPrompt="Need an internal account?"
                postLoginPath="/internal/home"
                demoCredentials={['Internal: admin@acme.com / password123']}
            />} />
            <Route path="/internal/signup" element={<SignUpScreen
                audience="internal"
                appLabel="SubSync Internal"
                heading="Request internal access"
                subheading="Internal accounts are provisioned by an administrator."
                loginPath="/internal/login"
                loginLabel="Back to sign in"
                loginPrompt="Already have internal access?"
            />} />
            <Route path="/internal/forgot-password" element={<ForgotPasswordScreen
                appLabel="SubSync Internal"
                heading="Request internal OTP"
                subheading="Enter your employee email to receive a one-time code."
                loginPath="/internal/login"
                resetPath="/internal/reset-password"
            />} />
            <Route path="/internal/reset-password" element={<ResetPasswordScreen
                appLabel="SubSync Internal"
                heading="Verify internal OTP"
                subheading="Enter the code sent to your employee email."
                loginPath="/internal/login"
                forgotPath="/internal/forgot-password"
            />} />

            {/* Internal Application */}
            <Route path="/internal/home" element={<HomeScreen />} />
            <Route path="/internal/subscription/other-info" element={<SubscriptionOtherInfoScreen />} />
            <Route path="/internal/quotation-sent" element={<QuotationSentScreen />} />
            <Route path="/internal/draft-invoice" element={<DraftInvoiceScreen />} />
            <Route path="/internal/invoice/new" element={<NewInvoiceScreen />} />
            <Route path="/internal/invoice/new/payment" element={<NewInvoicePaymentScreen />} />
            <Route path="/internal/invoices" element={<InvoicesScreen />} />
            <Route path="/internal/subscription/detail" element={<SubscriptionDetailScreen />} />

            <Route path="/internal" element={<Navigate to="/internal/home" replace />} />
            <Route path="/internal/users/detail" element={<UserDetailScreen />} />
            <Route path="/internal/configuration" element={<ConfigurationScreen />} />
            <Route path="/internal/configuration/recurring-plan" element={<RecurringPlanDetailScreen />} />
            <Route path="/internal/configuration/attribute" element={<AttributeDetailScreen />} />
            <Route path="/internal/configuration/quotation-template" element={<QuotationTemplateScreen />} />
            <Route path="/internal/configuration/variant" element={<VariantDetailScreen />} />
            <Route path="/internal/configuration/payment-term" element={<PaymentTermDetailScreen />} />
            <Route path="/internal/configuration/discount" element={<DiscountDetailScreen />} />
            <Route path="/internal/configuration/tax" element={<TaxDetailScreen />} />

            {/* User & Contact Management */}
            <Route path="/internal/contacts" element={<ContactsScreen />} />
            <Route path="/internal/contacts/detail" element={<ContactDetailScreen />} />

            {/* Product Management */}
            <Route path="/internal/products" element={<ProductsScreen />} />
            <Route path="/internal/products/new" element={<ProductNewScreen />} />
            <Route path="/internal/products/detail" element={<ProductDetailScreen />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
