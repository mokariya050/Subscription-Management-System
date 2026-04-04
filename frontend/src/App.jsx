import { useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen'
import SignUpScreen from './screens/SignUpScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import SplashLoadingBaseScreen from './screens/SplashLoadingScreen'
import SplashSuccessBaseScreen from './screens/SplashSuccessScreen'
import SplashErrorScreen from './screens/SplashErrorScreen'

function SplashLoadingScreen() {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/splash/success', { replace: true })
        }, 2000)

        return () => clearTimeout(timer)
    }, [navigate])

    return <SplashLoadingBaseScreen />
}

function SplashSuccessScreen() {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login', { replace: true })
        }, 1600)

        return () => clearTimeout(timer)
    }, [navigate])

    return <SplashSuccessBaseScreen />
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/splash/loading" replace />} />
            <Route path="/splash/loading" element={<SplashLoadingScreen />} />
            <Route path="/splash/success" element={<SplashSuccessScreen />} />
            <Route path="/splash/error" element={<SplashErrorScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
