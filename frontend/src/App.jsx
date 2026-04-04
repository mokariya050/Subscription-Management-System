import { Navigate, Route, Routes } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen'
import SignUpScreen from './screens/SignUpScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import SplashLoadingScreen from './screens/SplashLoadingScreen'
import SplashSuccessScreen from './screens/SplashSuccessScreen'
import SplashErrorScreen from './screens/SplashErrorScreen'
import HomeScreen from './screens/HomeScreen'
import SubscriptionOtherInfoScreen from './screens/SubscriptionOtherInfoScreen'
import QuotationSentScreen from './screens/QuotationSentScreen'
import DraftInvoiceScreen from './screens/DraftInvoiceScreen'
import NewInvoiceScreen from './screens/NewInvoiceScreen'
import NewInvoicePaymentScreen from './screens/NewInvoicePaymentScreen'
import SubscriptionDetailScreen from './screens/SubscriptionDetailScreen'
import UserDetailScreen from './screens/UserDetailScreen'
import ContactDetailScreen from './screens/ContactDetailScreen'
import ProductsScreen from './screens/ProductsScreen'
import ProductNewScreen from './screens/ProductNewScreen'
import ProductDetailScreen from './screens/ProductDetailScreen'
import ConfigurationScreen from './screens/ConfigurationScreen'
import RecurringPlanDetailScreen from './screens/RecurringPlanDetailScreen'
import AttributeDetailScreen from './screens/AttributeDetailScreen'
import QuotationTemplateScreen from './screens/QuotationTemplateScreen'
import TaxDetailScreen from './screens/TaxDetailScreen'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/splash/loading" replace />} />
            {/* Splash Screens */}
            <Route path="/splash/loading" element={<SplashLoadingScreen />} />
            <Route path="/splash/success" element={<SplashSuccessScreen />} />
            <Route path="/splash/error" element={<SplashErrorScreen />} />
            
            {/* Auth Screens */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            
            {/* Main Application */}
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/subscription/other-info" element={<SubscriptionOtherInfoScreen />} />
            <Route path="/quotation-sent" element={<QuotationSentScreen />} />
            <Route path="/draft-invoice" element={<DraftInvoiceScreen />} />
            <Route path="/invoice/new" element={<NewInvoiceScreen />} />
            <Route path="/invoice/new/payment" element={<NewInvoicePaymentScreen />} />
            <Route path="/subscription/detail" element={<SubscriptionDetailScreen />} />
            
            {/* User & Contact Management */}
            <Route path="/users/detail" element={<UserDetailScreen />} />
            <Route path="/contacts/detail" element={<ContactDetailScreen />} />
            
            {/* Product Management */}
            <Route path="/products" element={<ProductsScreen />} />
            <Route path="/products/new" element={<ProductNewScreen />} />
            <Route path="/products/detail" element={<ProductDetailScreen />} />
            
            {/* Configuration */}
            <Route path="/configuration" element={<ConfigurationScreen />} />
            <Route path="/configuration/recurring-plan" element={<RecurringPlanDetailScreen />} />
            <Route path="/configuration/attribute" element={<AttributeDetailScreen />} />
            <Route path="/configuration/quotation-template" element={<QuotationTemplateScreen />} />
            <Route path="/configuration/tax" element={<TaxDetailScreen />} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
