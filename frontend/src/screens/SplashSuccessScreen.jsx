import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SplashSuccessScreen() {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home', { replace: true })
        }, 1500)
        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="bg-surface font-body text-on-surface m-0 p-0 overflow-hidden relative w-full h-screen flex flex-col items-center justify-center">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #1b2d4f 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Geometric Accent */}
            <div className="absolute top-20 right-20 w-64 h-64 border-t border-r border-primary opacity-5 pointer-events-none"></div>
            <div className="absolute bottom-20 left-20 w-96 h-32 border-b border-l border-primary opacity-5 pointer-events-none"></div>

            {/* Main Identity Block */}
            <div className="flex flex-col items-center text-center z-10">
                {/* Logo Icon */}
                <div className="w-[80px] h-[80px] bg-primary rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                        check_circle
                    </span>
                </div>
                
                {/* Brand Name */}
                <h1 className="font-serif text-[32px] text-primary font-bold tracking-tight mb-1 italic">
                    SubSync
                </h1>
                
                {/* Tagline */}
                <p className="font-label text-[12px] text-on-surface-variant tracking-[0.2em] uppercase mb-12 font-bold opacity-60">
                    Subscription & Billing Management
                </p>

                {/* Progress Indicator */}
                <div className="flex flex-col items-center">
                    <div className="w-[200px] h-[3px] bg-surface-container-highest rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-tertiary-fixed-dim w-full"></div>
                    </div>
                    {/* Status Text */}
                    <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-bold opacity-80 animate-bounce">
                        System Ready 👋
                    </span>
                </div>
            </div>

            {/* Decorative Aesthetic Element */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
                <span className="font-serif text-[10px] tracking-[0.4em] uppercase text-primary font-bold">The Curated Ledger — v2.4.0</span>
            </div>
        </div>
    )
}
