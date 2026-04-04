import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SplashLoadingScreen() {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/internal/home', { replace: true })
        }, 2000)
        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="bg-surface font-body text-on-surface m-0 p-0 overflow-hidden relative w-full h-screen flex flex-col items-center justify-center">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #1b2d4f 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Geometric Accent */}
            <div className="absolute top-1/4 left-1/4 w-32 h-px bg-primary opacity-5 transform -rotate-45"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-px bg-primary opacity-5 transform rotate-12"></div>

            {/* Main Identity Block */}
            <div className="flex flex-col items-center text-center z-10">
                {/* Logo Icon */}
                <div className="w-[80px] h-[80px] bg-primary rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 animate-pulse">
                    <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                        sync_saved_locally
                    </span>
                </div>

                {/* Brand Name */}
                <h1 className="font-serif text-[32px] text-primary font-bold tracking-tight mb-1 italic">
                    SubSync
                </h1>

                {/* Tagline */}
                <p className="font-label text-[12px] text-on-surface-variant tracking-[0.2em] uppercase mb-12 font-bold opacity-60">
                    Subscription & Billing Ledger
                </p>

                {/* Loading State Container */}
                <div className="flex flex-col items-center">
                    {/* Progress Bar Shell */}
                    <div className="w-[200px] h-[3px] bg-surface-container-highest rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-[#e8a838] animate-[progress_2s_infinite_ease-in-out]" style={{ width: '40%', position: 'relative' }}></div>
                    </div>
                    {/* Loading Text */}
                    <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-bold opacity-80">
                        Synchronizing Ledger
                    </span>
                </div>
            </div>

            {/* Decorative Aesthetic Element */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
                <span className="font-serif text-[10px] tracking-[0.4em] uppercase text-primary font-bold">The Curated Ledger</span>
            </div>

            <style>{`
                @keyframes progress {
                    0% { left: -40%; width: 40%; }
                    50% { left: 40%; width: 60%; }
                    100% { left: 100%; width: 40%; }
                }
            `}</style>
        </div>
    )
}
