import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SplashScreen() {
    const [status, setStatus] = useState('loading') // loading, success, error
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            const random = Math.random()
            if (random > 0.2) {
                setStatus('success')
                setTimeout(() => navigate('/login'), 2000)
            } else {
                setStatus('error')
            }
        }, 2000)
        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary to-primary-container flex items-center justify-center p-4">
            <div className="text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold text-white">SubSync</h1>
                    <p className="text-xl text-surface">Subscription Management Made Easy</p>
                </div>

                {status === 'loading' && (
                    <div className="flex justify-center">
                        <div className="w-12 h-12 border-4 border-white border-t-surface rounded-full animate-spin"></div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <svg className="w-20 h-20 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-white text-lg">All systems ready!</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <svg className="w-20 h-20 text-error" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                        <p className="text-white text-lg">Connection error</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-white text-primary rounded-lg font-medium hover:bg-surface transition"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
