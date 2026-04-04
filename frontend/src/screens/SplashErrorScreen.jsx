import { Link } from 'react-router-dom'

export default function SplashErrorScreen() {
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
                <div className="w-[80px] h-[80px] bg-error-container rounded-[24px] flex items-center justify-center shadow-lg mb-6">
                    <span className="material-symbols-outlined text-error text-5xl">
                        report_gmailerrorred
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

                {/* Error State Container */}
                <div className="flex flex-col items-center">
                    <div className="w-[200px] h-[3px] bg-error/10 rounded-full overflow-hidden mb-4 relative">
                        <div className="h-full bg-error rounded-full" style={{ width: '33.33%' }}></div>
                    </div>

                    <p className="text-error font-bold text-sm mb-4 uppercase tracking-widest">Synchronization Interrupted</p>

                    <Link to="/internal/login" className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] hover:underline bg-surface-container px-6 py-2 rounded-full transition-all">
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Retry Connection
                    </Link>
                </div>
            </div>

            {/* Decorative Aesthetic Element */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
                <span className="font-serif text-[10px] tracking-[0.4em] uppercase text-primary font-bold">The Curated Ledger</span>
            </div>
        </div>
    )
}
