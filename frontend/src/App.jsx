import { Navigate, Route, Routes } from 'react-router-dom'

function HtmlScreen({ src, title }) {
    return (
        <iframe
            title={title}
            src={src}
            className="screen-frame"
            loading="eager"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
        />
    )
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/splash/loading" replace />} />
            <Route path="/splash/loading" element={<HtmlScreen title="Splash Loading" src="/screens/splash_screen_initial_load/code.html" />} />
            <Route path="/splash/success" element={<HtmlScreen title="Splash Success" src="/screens/splash_screen_success_state/code.html" />} />
            <Route path="/splash/error" element={<HtmlScreen title="Splash Error" src="/screens/splash_screen_error_state/code.html" />} />
            <Route path="/login" element={<HtmlScreen title="Login" src="/screens/login_subsync/code.html" />} />
            <Route path="/signup" element={<HtmlScreen title="Sign Up" src="/screens/sign_up_subsync/code.html" />} />
            <Route path="/reset-password" element={<HtmlScreen title="Reset Password" src="/screens/reset_password_subsync/code.html" />} />
        </Routes>
    )
}
