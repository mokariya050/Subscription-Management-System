import ScreenFrame from '../components/ScreenFrame'

const html = String.raw`<!DOCTYPE html>

<html class="light" lang="en">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&amp;family=Manrope:wght@400;500;600;700;800&amp;display=swap"
        rel="stylesheet" />
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
        rel="stylesheet" />
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
        rel="stylesheet" />
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "error": "#ba1a1a",
                        "on-tertiary-fixed-variant": "#614000",
                        "primary-fixed-dim": "#b5c6f1",
                        "secondary": "#4e6073",
                        "surface-variant": "#e4e2de",
                        "primary-fixed": "#d8e2ff",
                        "tertiary": "#251600",
                        "inverse-primary": "#b5c6f1",
                        "on-tertiary-container": "#c58a18",
                        "on-secondary": "#ffffff",
                        "primary-container": "#1b2d4f",
                        "on-primary-fixed-variant": "#35466a",
                        "inverse-surface": "#30312e",
                        "secondary-fixed": "#d1e4fb",
                        "surface": "#fbf9f5",
                        "primary": "#031839",
                        "error-container": "#ffdad6",
                        "on-primary-fixed": "#061b3c",
                        "outline-variant": "#c5c6cf",
                        "surface-container-lowest": "#ffffff",
                        "background": "#fbf9f5",
                        "tertiary-fixed": "#ffddaf",
                        "on-tertiary": "#ffffff",
                        "secondary-fixed-dim": "#b5c8df",
                        "on-error": "#ffffff",
                        "outline": "#75777f",
                        "on-error-container": "#93000a",
                        "surface-container": "#f0eeea",
                        "surface-container-highest": "#e4e2de",
                        "on-surface": "#1b1c1a",
                        "inverse-on-surface": "#f2f0ec",
                        "on-tertiary-fixed": "#281800",
                        "on-primary": "#ffffff",
                        "tertiary-container": "#402900",
                        "on-secondary-fixed": "#091d2e",
                        "tertiary-fixed-dim": "#fdba49",
                        "on-secondary-container": "#526478",
                        "on-background": "#1b1c1a",
                        "surface-bright": "#fbf9f5",
                        "surface-dim": "#dbdad6",
                        "on-surface-variant": "#44474e",
                        "on-primary-container": "#8495bd",
                        "on-secondary-fixed-variant": "#36485b",
                        "surface-container-low": "#f5f3ef",
                        "secondary-container": "#cfe2f9",
                        "surface-tint": "#4d5e83",
                        "surface-container-high": "#eae8e4"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "fontFamily": {
                        "headline": ["Noto Serif"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    }
                },
            },
        }
    </script>
    <style>
        body {
            font-family: 'Manrope', sans-serif;
        }

        .font-serif {
            font-family: 'Noto Serif', serif;
        }

        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Custom elevation using Primary Ink at 5% opacity */
        .premium-shadow {
            box-shadow: 0 10px 40px rgba(3, 24, 57, 0.05);
        }
    </style>
</head>

<body class="bg-surface-container-low min-h-screen flex items-center justify-center overflow-x-hidden">
    <!-- 50/50 Split Layout Container -->
    <main class="flex flex-col md:flex-row w-full min-h-screen">
        <!-- Left Section: Geometric Pattern -->
        <section class="hidden md:flex md:w-1/2 bg-surface items-center justify-center relative overflow-hidden">
            <!-- Asymmetric Geometric Line Pattern -->
            <svg class="absolute inset-0 w-full h-full opacity-[0.08]" preserveaspectratio="none" viewbox="0 0 100 100">
                <line stroke="#031839" stroke-width="0.1" x1="10" x2="90" y1="0" y2="100"></line>
                <line stroke="#031839" stroke-width="0.1" x1="0" x2="100" y1="20" y2="80"></line>
                <line stroke="#031839" stroke-width="0.1" x1="30" x2="30" y1="0" y2="100"></line>
                <circle cx="70" cy="30" fill="none" r="15" stroke="#031839" stroke-width="0.1"></circle>
                <rect fill="none" height="20" stroke="#031839" stroke-width="0.1" width="40" x="10" y="60"></rect>
            </svg>
            <div class="relative z-10 p-12 max-w-lg">
                <span
                    class="text-xs uppercase tracking-widest font-label font-extrabold text-primary mb-4 block">SubSync
                    Ledger</span>
                <h2 class="text-5xl font-serif text-primary leading-tight mb-6">Financial clarity through intentional
                    design.</h2>
                <p class="text-on-surface-variant font-body leading-relaxed">Secure your subscription data with
                    industry-leading encryption and a clean, editorial approach to asset management.</p>
            </div>
        </section>
        <!-- Right Section: Auth Cards -->
        <section class="w-full md:w-1/2 flex flex-col items-center justify-center p-6 space-y-12">
            <!-- Branding Header (Mobile or for context) -->
            <div class="mb-4 flex flex-col items-center">
                <h1 class="text-2xl font-serif font-bold text-primary tracking-tight">SubSync</h1>
            </div>
            <!-- State 1: Enter Email -->
            <div
                class="w-full max-w-[420px] bg-surface-container-lowest p-10 rounded-lg premium-shadow transition-all duration-200">
                <div class="text-center mb-8">
                    <h2 class="text-2xl font-serif text-primary font-bold mb-2">Reset your password</h2>
                    <p class="text-on-surface-variant text-sm font-body">We'll send a reset link to your email</p>
                </div>
                <form class="space-y-6">
                    <div class="space-y-2">
                        <label
                            class="text-xs uppercase tracking-widest font-label font-bold text-on-surface-variant px-1"
                            for="email">Email Address</label>
                        <input
                            class="w-full px-4 py-3 bg-surface-container-highest rounded-md border-none focus:ring-0 focus:border-2 focus:border-primary transition-all duration-200 text-on-surface font-body outline-none"
                            id="email" placeholder="name@company.com" required="" type="email" />
                    </div>
                    <button
                        class="w-full py-4 bg-primary text-on-primary font-bold rounded-md hover:bg-opacity-90 active:scale-[0.99] transition-all duration-200 shadow-sm"
                        type="submit">
                        Send Reset Link
                    </button>
                </form>
                <div class="mt-8 text-center">
                    <a class="text-sm font-semibold text-tertiary-fixed-dim hover:underline transition-all duration-200"
                        href="/login" target="_top">
                        Back to Sign In
                    </a>
                </div>
            </div>
            <!-- Divider or Connector (Visual only for the mockup) -->
            <div class="w-12 h-[1px] bg-outline-variant opacity-20"></div>
            <!-- State 2: Email Sent (Success) -->
            <div
                class="w-full max-w-[420px] bg-surface-container-lowest p-10 rounded-lg premium-shadow transition-all duration-200">
                <div class="flex flex-col items-center text-center">
                    <!-- Icon in Circle -->
                    <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
                        <span class="material-symbols-outlined text-tertiary-fixed-dim text-4xl" data-weight="fill"
                            style="font-variation-settings: 'FILL' 1;">
                            check_circle
                        </span>
                    </div>
                    <h2 class="text-2xl font-serif text-primary font-bold mb-2">Check your inbox</h2>
                    <p class="text-on-surface-variant text-sm font-body mb-8">
                        A reset link was sent to <span class="font-bold text-primary">you@company.com</span>
                    </p>
                    <div class="w-full space-y-4">
                        <button
                            class="w-full py-4 bg-surface-container-high text-primary font-bold rounded-md hover:bg-surface-container-highest transition-all duration-200">
                            Resend email
                        </button>
                        <div class="pt-4">
                            <a class="text-sm font-semibold text-tertiary-fixed-dim hover:underline transition-all duration-200"
                                href="/login" target="_top">
                                Back to Sign In
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Footer Links -->
            <footer class="mt-12 w-full max-w-[420px] flex justify-between px-2">
                <p class="text-[10px] uppercase tracking-widest font-label text-slate-400">© 2024 SubSync Ledger</p>
                <div class="flex gap-4">
                    <a class="text-[10px] uppercase tracking-widest font-label text-slate-400 hover:text-primary transition-colors"
                        href="#">Privacy</a>
                    <a class="text-[10px] uppercase tracking-widest font-label text-slate-400 hover:text-primary transition-colors"
                        href="#">Terms</a>
                </div>
            </footer>
        </section>
    </main>
</body>

</html>`

export default function ResetPasswordScreen() {
  return <ScreenFrame title="Reset Password" html={html} />
}
