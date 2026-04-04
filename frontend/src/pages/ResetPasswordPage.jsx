export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">SubSync</h1>
                    <p className="text-on-surface mt-2">Reset your password</p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
                        <input type="email" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="you@example.com" />
                    </div>

                    <p className="text-sm text-on-surface">We'll send you a link to reset your password.</p>

                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-container transition">
                        Send Reset Link
                    </button>
                </form>

                <p className="text-center text-sm text-on-surface">Remember your password? <a href="/login" className="text-primary hover:underline">Sign in</a></p>
            </div>
        </div>
    )
}
